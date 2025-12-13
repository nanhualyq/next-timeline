import { XMLParser } from "fast-xml-parser";
import CrawlerBase from "./CrawlerBase";
import { get } from "lodash-es";
import { createInsertSchema } from "drizzle-zod";
import { articleTable, channelTable } from "../db/schema";
import { formatISO } from "date-fns";
import { JSDOM } from "jsdom";
import { db } from "../db";
import { insertArticles } from "../db/article";

export default class RssCrawler extends CrawlerBase {
  xmlObject: unknown;

  async download() {
    const xml = await fetch(this.channel.link).then((response) =>
      response.text()
    );
    const parser = new XMLParser({
      ignoreAttributes: false,
    });
    this.xmlObject = parser.parse(xml);
  }

  getXmlValue(item: unknown, path: string) {
    return get(item, `${path}.#text`) || get(item, path);
  }

  parseChannel() {
    const G = this.getXmlValue;
    const item =
      get(this.xmlObject, "rss.channel") || get(this.xmlObject, "feed");

    const channelSchema = createInsertSchema(channelTable);
    return channelSchema.parse({
      type: "rss",
      title: G(item, "title"),
      link: this.channel.link,
      description: G(item, "description") || G(item, "subtitle"),
      icon: "",
    });
  }

  parseArticles() {
    const items = get(this.xmlObject, "rss.channel.item");
    const entries = get(this.xmlObject, "feed.entry");
    const articles = [];
    const articleSchema = createInsertSchema(articleTable);
    const G = this.getXmlValue;
    for (const item of items || entries || []) {
      const content = this.parseArticleContent(item);
      const article = articleSchema.parse({
        channel_id: this.channel.id || 0,
        title: G(item, "title"),
        link: G(item, "link.@_href") || G(item, "link") || G(item, "guid"),
        summary: G(item, "summary") || G(item, "description"),
        content: content,
        pub_time: this.parseArticlePubtime(item),
        cover: this.parseArticleCover(content),
        author: this.parseArticleAuthor(item),
      });
      articles.push(article);
    }
    return articles;
  }

  private parseArticleAuthor(item: unknown) {
    const author =
      get(item, "author.name") ||
      get(item, "dc:creator") ||
      this.getXmlValue(item, "creator") ||
      this.getXmlValue(item, "author");
    if (typeof author === "string") {
      return author;
    }
  }
  private parseArticleContent(item: unknown) {
    const G = this.getXmlValue;
    return (
      G(item, "content:encoded") || G(item, "content") || G(item, "description")
    );
  }
  private parseArticlePubtime(item: unknown) {
    const time =
      this.getXmlValue(item, "published") || this.getXmlValue(item, "pubDate");
    if (!time) {
      return "";
    }
    return formatISO(time);
  }

  private parseArticleCover(html: string): string | undefined {
    const dom = new JSDOM();
    const parser = new dom.window.DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.querySelector("img")?.src;
  }

  async saveChannel() {
    if (this.channel.id) {
      return;
    }
    const channel = this.parseChannel();
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
