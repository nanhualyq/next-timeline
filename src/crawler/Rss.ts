import { XMLParser } from "fast-xml-parser";
import CrawlerBase from "./CrawlerBase";
import { get, omit } from "lodash-es";
import z from "zod";
import { db } from "../db";
import { channelTable } from "../db/schema";
import { insertArticles } from "../db/article";

const FeedZod = z.looseObject({
  title: z.string(),
  link: z.string(),
  description: z.string(),
});

const ItemsZod = z.array(
  z.looseObject({
    title: z.string(),
    guid: z.string().optional(),
    link: z.string(),
    description: z.string(),
    pubDate: z.string(),
  })
);

class Rss extends CrawlerBase {
  private xmlObject: unknown;
  async crawler() {
    const xml = await fetch(this.url).then((response) => response.text());
    const parser = new XMLParser({
      ignoreAttributes: false,
    });
    this.xmlObject = parser.parse(xml);
  }
  get feed() {
    let o;
    const channel = get(this.xmlObject, "rss.channel");
    if (channel) {
      o = omit(channel, "item");
    }
    const feed = get(this.xmlObject, "feed");
    if (feed) {
      o = this.feed2channel(omit(feed, "entry"));
    }
    return FeedZod.parse(o);
  }
  feed2channel(feed: unknown) {
    return Object.assign({}, feed, {
      link: this.url,
      description: get(feed, "subtitle"),
    });
  }
  get items() {
    let o;
    const items = get(this.xmlObject, "rss.channel.item");
    if (items) {
      o = items;
    }
    const entries = get(this.xmlObject, "feed.entry");
    if (entries) {
      o = this.entries2items(entries);
    }
    return ItemsZod.parse(o);
  }
  entries2items(entries: never[]) {
    return entries.map((entry) => {
      return Object.assign({}, entry, {
        link: get(entry, "link.@_href"),
        description: get(entry, "content.#text") || get(entry, "content"),
        pubDate: get(entry, "published"),
      });
    });
  }
  saveChannel() {
    return db.insert(channelTable).values(this.feed);
  }
  saveArticles(channel_id: number) {
    return insertArticles(
      this.items.map((item) => {
        return Object.assign({}, item, {
          channel_id,
          content: item.description,
          pub_time: item.pubDate,
        });
      })
    );
  }
}

export default Rss;
