import RssCrawler from "@/src/crawler/RssCrawler";
import { db } from "@/src/db";
import { channelTable, crawlerLogTable } from "@/src/db/schema";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function makeCrawler() {
  const crawler = new RssCrawler({
    id: 1,
    link: "http://a.com",
    type: "rss",
  });
  vi.spyOn(crawler, "download").mockReturnValueOnce(Promise.resolve());
  vi.spyOn(crawler, "saveChannel").mockReturnValueOnce(Promise.resolve());
  vi.spyOn(crawler, "saveArticles").mockReturnValueOnce(Promise.resolve([]));
  const values = vi.fn().mockRejectedValueOnce({
    catch: () => {},
  });
  vi.spyOn(db, "insert").mockReturnValueOnce({
    values,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
  return {
    crawler,
    values,
  };
}

describe("CrawlerBase", async () => {
  describe("start()", async () => {
    beforeEach(async () => {
      db.insert(channelTable).values({
        title: "test",
        link: "test",
        type: "rss",
      });
    });
    afterEach(async () => {
      db.delete(channelTable);
      db.delete(crawlerLogTable);
      vi.clearAllMocks();
    });
    it("success log", async () => {
      const { crawler, values } = makeCrawler();
      await crawler.start();
      expect(values).toHaveBeenCalledWith({
        channel_id: 1,
        status: "success",
        result: "0 rows inserted",
      });
    });
    it("error log", async () => {
      const { crawler, values } = makeCrawler();
      vi.spyOn(crawler, "download").mockReset().mockRejectedValueOnce("test");
      await crawler.start().catch(() => {});
      expect(values).toHaveBeenCalledWith({
        channel_id: 1,
        status: "error",
        result: "test",
      });
    });
    it("skip when no channel", async () => {
      const { crawler, values } = makeCrawler();
      delete crawler.channel.id;
      await crawler.start();
      expect(values).not.toBeCalled();
    });
  });
});
