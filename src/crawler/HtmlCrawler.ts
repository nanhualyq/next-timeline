import { createInsertSchema } from "drizzle-zod";
import { addOrGetChannel } from "../db/channel";
import CrawlerBase from "./CrawlerBase";
import { JSDOM } from "jsdom";
import { articleTable, channelTable } from "../db/schema";
import { insertArticles } from "../db/article";

export default class HtmlCrawler extends CrawlerBase {
  document?: Document;

  async download() {
    const html = await fetch(this.channel.link!, {
      signal: AbortSignal.timeout(20_000),
    }).then((response) => response.text());
    this.parseHtml(html);
  }

  parseHtml(html: string) {
    const dom = new JSDOM();
    const parser = new dom.window.DOMParser();
    this.document = parser.parseFromString(html, "text/html");
  }

  async saveChannel() {
    if (this.channel.id) {
      return;
    }
    const channelSchema = createInsertSchema(channelTable);
    const channel = channelSchema.parse(this.channel);
    const res = await addOrGetChannel(channel);
    if (res) {
      this.channel = res;
    }
  }

  parseArticles() {
    if (!this.document) {
      throw Error("No document");
    }
    if (!this.channel.items_code) {
      throw Error("No items code");
    }
    const f = new Function("document", this.channel.items_code);
    const articles = f(this.document);
    const articleSchema = createInsertSchema(articleTable);
    for (const item of articles) {
      item.channel_id = this.channel.id;
      item.pub_time ||= new Date().toISOString();
      articleSchema.parse(item);
    }
    return articles;
  }

  saveArticles() {
    if (!this.channel.id) {
      throw Error("No channel");
    }
    return insertArticles(this.parseArticles());
  }
}
