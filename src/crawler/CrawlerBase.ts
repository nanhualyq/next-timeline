import { channelTable } from "../db/schema";

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
  abstract saveArticles(): void;
}
