import { XMLParser } from "fast-xml-parser";
import CrawlerBase from "./CrawlerBase";
import { get } from "lodash-es";
import { createInsertSchema } from "drizzle-zod";
import { articleTable, channelTable } from "../db/schema";
import { formatISO } from "date-fns";
import { JSDOM } from "jsdom";
import { db } from "../db";
import { insertArticles } from "../db/article";
import { setGlobalDispatcher, Agent } from "undici";
import sanitizeHtml from "sanitize-html";

// Set the global connection timeout to 20 seconds
setGlobalDispatcher(
  new Agent({
    connect: { timeout: 20_000 },
  })
);

function parseHtml(html: string) {
  const dom = new JSDOM();
  const parser = new dom.window.DOMParser();
  return parser.parseFromString(html, "text/html");
}

export default class RssCrawler extends CrawlerBase {
  xmlObject: unknown;

  async download() {
    const xml = await fetch(this.channel.link, {
      signal: AbortSignal.timeout(20_000),
    }).then((response) => response.text());
    this.parseXml(xml);
  }

  parseXml(xml: string) {
    const parser = new XMLParser({
      ignoreAttributes: false,
      alwaysCreateTextNode: true,
    });
    this.xmlObject = parser.parse(xml);
  }

  parseChannel() {
    const item =
      get(this.xmlObject, "rss.channel") || get(this.xmlObject, "feed");

    const channelSchema = createInsertSchema(channelTable);
    return channelSchema.parse({
      type: "rss",
      title: get(item, "title.#text"),
      link: this.channel.link,
      description:
        get(item, "description.#text") || get(item, "subtitle.#text"),
      icon: "",
    });
  }

  async parseFavicon() {
    const channelLink = new URL(this.channel.link).origin;
    const articleLink = this.parseArticleLink(this.items[0]);
    const urls = [channelLink, articleLink];
    for (const url of urls) {
      if (!url) {
        continue;
      }
      const html = await fetch(url).then((r) => r.text());
      const icon = parseHtml(html)
        .querySelector(`link[rel~="icon"]`)
        ?.getAttribute("href");
      if (icon) {
        return new URL(icon, url).href;
      }
    }
    if (articleLink) {
      return new URL(articleLink).origin + "/favicon.ico";
    }
    return "";
  }

  get items() {
    const items = get(this.xmlObject, "rss.channel.item");
    const entries = get(this.xmlObject, "feed.entry");
    const res = items || entries;
    if (res && !Array.isArray(res)) {
      return [res];
    }
    return (res || []).slice(0, 20);
  }

  parseArticleLink(item: unknown): string | undefined {
    return (
      get(item, "link.@_href") ||
      get(item, "link.#text") ||
      get(item, "guid.#text")
    );
  }

  parseArticles() {
    const articles = [];
    const articleSchema = createInsertSchema(articleTable);
    for (const item of this.items) {
      const content = this.parseArticleContent(item);
      const article = articleSchema.parse({
        channel_id: this.channel.id || 0,
        title: get(item, "title.#text"),
        link: this.parseArticleLink(item),
        summary: this.parseArticleSummay(item, content),
        content: content,
        pub_time: this.parseArticlePubtime(item),
        cover: this.parseArticleCover(item, content),
        author: this.parseArticleAuthor(item),
      });
      articles.push(article);
    }
    return articles;
  }

  parseArticleSummay(item: unknown, content: string) {
    let text: string | undefined = get(item, "summary.#text");
    if (get(item, "content:encoded.#text")) {
      text = get(item, "description.#text");
    }
    const plainText =
      parseHtml(text || content).querySelector("body")?.textContent || "";
    return plainText?.substring(0, 200) || "";
  }
  private parseArticleAuthor(item: unknown) {
    const author =
      get(item, "author.name.#text") ||
      get(item, "dc:creator.#text") ||
      get(item, "creator.#text") ||
      get(item, "author.#text");
    if (typeof author === "string") {
      return author;
    }
  }
  parseArticleContent(item: unknown) {
    const html =
      get(item, "content:encoded.#text") ||
      get(item, "content.#text") ||
      get(item, "description.#text") ||
      get(item, "media:group.media:description.#text") ||
      "";
    return sanitizeHtml(html);
  }
  private parseArticlePubtime(item: unknown) {
    const time = get(item, "published.#text") || get(item, "pubDate.#text");
    if (!time) {
      return "";
    }
    return formatISO(time);
  }

  parseArticleCover(item: unknown, content: string): string | undefined {
    const thumbnail =
      get(item, "media:thumbnail.@_url") ||
      get(item, "media:group.media:thumbnail.@_url");
    return thumbnail || parseHtml(content).querySelector("img")?.src;
  }

  async saveChannel() {
    if (this.channel.id) {
      return;
    }
    const channel = this.parseChannel();
    channel.icon = await this.parseFavicon();
    const res = await db.insert(channelTable).values(channel);
    this.channel = {
      id: Number(res.lastInsertRowid),
      ...channel,
    } as typeof channelTable.$inferInsert;
  }
  saveArticles() {
    if (!this.channel.id) {
      throw Error("No channel");
    }
    return insertArticles(this.parseArticles());
  }
}
