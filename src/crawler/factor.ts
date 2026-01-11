import { inputChannel } from "./CrawlerBase";
import HtmlCrawler from "./HtmlCrawler";
import RssCrawler from "./RssCrawler";

export function crawlerFactor(channel: inputChannel) {
  if (channel.type === "rss") {
    return new RssCrawler(channel);
  } else if (channel.type === "html") {
    return new HtmlCrawler(channel);
  } else {
    throw Error(`${channel.type} is not a valid crawler type`);
  }
}
