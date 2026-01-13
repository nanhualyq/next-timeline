import { eq } from "drizzle-orm";
import { db } from "../db";
import { articleTable, channelTable, crawlerLogTable } from "../db/schema";
import { JSDOM } from "jsdom";

type Channel = typeof channelTable.$inferSelect;
type EmptyChannel = Partial<Channel>;

export type inputChannel = Channel | EmptyChannel;

export default abstract class CrawlerBase {
  constructor(public channel: inputChannel) {
    if (!this.channel.link) {
      throw new Error("Channel link is required");
    }
  }
  abstract download(): Promise<unknown>;
  abstract saveChannel(): void;
  abstract saveArticles(): Promise<unknown[]>;
  async start() {
    const log = {
      status: "success",
      result: "",
    } as typeof crawlerLogTable.$inferInsert;
    try {
      await this.download();
      await this.saveChannel();
      const rows = await this.saveArticles();
      if (rows.length) {
        log.result = `${rows.length} rows inserted`;
      }
    } catch (error) {
      log.status = "error";
      log.result = error + "";
      throw error;
    } finally {
      if (this.channel.id && log.result) {
        db.insert(crawlerLogTable)
          .values({
            ...log,
            channel_id: this.channel.id,
          })
          .catch(console.error);
      }
    }
  }
  async parseFavicon(articleLink = "") {
    const channelLink = new URL(this.channel.link!).origin;
    const urls = [channelLink, articleLink];
    for (const url of urls) {
      if (!url) {
        continue;
      }
      const html = await fetch(url).then((r) => r.text());
      const icon = new JSDOM(html).window.document
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
  async updateIcon() {
    const articles = await db
      .select()
      .from(articleTable)
      .where(eq(articleTable.channel_id, this.channel.id!))
      .limit(1);
    const icon = await this.parseFavicon(articles[0]?.link);
    if (icon) {
      await db
        .update(channelTable)
        .set({ icon })
        .where(eq(channelTable.id, this.channel.id!));
    }
  }
}
