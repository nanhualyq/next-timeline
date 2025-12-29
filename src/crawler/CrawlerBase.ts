import { db } from "../db";
import { channelTable, crawlerLogTable } from "../db/schema";

type Channel = typeof channelTable.$inferSelect;
type EmptyChannel = {
  id?: number;
  type: string;
  link: string;
};
export type inputChannel = Channel | EmptyChannel;

export default abstract class CrawlerBase {
  constructor(public channel: inputChannel) {}
  abstract download(): Promise<unknown>;
  abstract saveChannel(): void;
  abstract saveArticles(): unknown[];
  async start() {
    const log = {
      status: "success",
      result: "",
    } as typeof crawlerLogTable.$inferInsert;
    try {
      await this.download();
      await this.saveChannel();
      const rows = await this.saveArticles();
      log.result = `${rows.length} rows inserted`;
    } catch (error) {
      log.status = "error";
      log.result = error + "";
      throw error;
    } finally {
      if (this.channel.id) {
        db.insert(crawlerLogTable)
          .values({
            ...log,
            channel_id: this.channel.id,
          })
          .catch(console.error);
      }
    }
  }
}
