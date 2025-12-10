import { readFileSync } from "fs";
import Rss, { ItemFactor } from "../../../src/crawler/Rss";
import path from "path";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";

beforeEach(() => {
  global.fetch = vi.fn(); // mock fetch globally
});

function readRssFile(uri: string) {
  return readFileSync(path.join(__dirname, "xml", uri), "utf8");
}

const fileList = [
  ["https://blog.codingnow.com/atom.xml", "yunfeng.xml"],
  ["https://feeds.feedburner.com/ruanyifeng", "ruanyifeng.xml"],
];

async function crawlerFile(file: string) {
  (fetch as Mock).mockResolvedValueOnce({
    ok: true,
    text: async () => readRssFile(file),
  });
  const rss = new Rss("");
  await rss.crawler();
  return rss;
}

describe("Rss", () => {
  describe("crawler", () => {
    for (const [, file] of fileList) {
      it(file, async () => {
        const rss = await crawlerFile(file);
        // expect(() => rss.feed).not.toThrow();
        // expect(() => rss.items).not.toThrow();
        expect(rss.feed).toBeTruthy();
        expect(rss.items).toBeTruthy();
      });
    }
    it("parse error", async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        text: async () => `<xml>error</xml>`,
      });
      const rss = new Rss("");
      await rss.crawler();
      expect(() => rss.feed).toThrow();
      expect(() => rss.items).toThrow();
    });
  });
});

describe("ItemFactor", () => {
  it("item has field content:encoded", () => {
    const src = "http://123.com/1.jpg";
    const article = new ItemFactor({
      title: "",
      link: "",
      description: "desc",
      pubDate: "",
      "content:encoded": `<p><img src="${src}"><img src="otherImg"></p>`,
    }).article;
    expect(article.summary).toBe("desc");
    expect(article.content).contain("otherImg");
    expect(article.cover).toBe(src);
  });
});
