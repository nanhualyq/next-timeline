import { inputChannel } from "./CrawlerBase";
import RssCrawler from "./RssCrawler";

export function crawlerFactor(channel: inputChannel) {
  if (channel.type === "rss") {
    return new RssCrawler(channel);
  } else {
    throw Error(`${channel.type} is not a valid crawler type`);
  }
}
