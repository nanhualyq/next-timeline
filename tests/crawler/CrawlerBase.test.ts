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
      expect(values).not.toBeCalled();
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
  describe("parseFavicon", () => {
    let rssCrawler: RssCrawler;
    const mockFetch = vi.fn();

    beforeEach(() => {
      // 在每個測試案例之前，重新初始化 RssCrawler 實例
      rssCrawler = new RssCrawler({ link: "http://a.com", type: "rss" });
      // 將全局的 fetch 替換為我們的 mockFetch
      global.fetch = mockFetch;
    });

    afterEach(() => {
      // 在每個測試案例之後，清除所有的 mock
      vi.clearAllMocks();
      // 恢復全局的 fetch (如果需要，但通常在測試框架中會自動處理)
      // delete global.fetch;
    });
    it("works", async () => {
      const url = "https://cdn.oaistatic.com/assets/favicon-eex17e9e.ico";
      const html = `<head><link rel="icon" href="${url}" sizes="32x32"/></head>`;
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(html),
      });
      const icon = await rssCrawler.parseFavicon();
      expect(icon).toBe(url);
    });
    it("works when rel contains other words", async () => {
      const url = "https://cdn.oaistatic.com/assets/favicon-eex17e9e.ico";
      const html = `<head><link rel="shortcut icon" href="${url}" sizes="32x32"/></head>`;
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(html),
      });
      const icon = await rssCrawler.parseFavicon();
      expect(icon).toBe(url);
    });
    it("works then href is a relative path", async () => {
      const html = `<head><link rel="icon" type="image/x-icon" href="../favicon.ico" /></head>`;
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(html),
      });
      const icon = await rssCrawler.parseFavicon();
      expect(icon).toBe(`${rssCrawler.channel.link}/favicon.ico`);
    });
    it("gets empty", async () => {
      const url = "https://cdn.oaistatic.com/assets/favicon-eex17e9e.ico";
      const html = `<head><error-link rel="icon" href="${url}" sizes="32x32"/></head>`;
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(html),
      });
      const icon = await rssCrawler.parseFavicon();
      expect(icon).toBe("");
    });
    it("gets default favicon by article link", async () => {
      mockFetch.mockResolvedValue({
        text: () => Promise.resolve(""),
      });
      const origin = "http://123.com";
      const icon = await rssCrawler.parseFavicon(origin + "/a/b/c.html");
      expect(icon).toBe(origin + "/favicon.ico");
    });
  });
});
