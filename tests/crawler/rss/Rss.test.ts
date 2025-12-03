import { readFileSync } from "fs";
import Rss from "../../../src/crawler/Rss";
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

describe("Rss", () => {
  describe("crawler", () => {
    for (const [url, file] of fileList) {
      it(file, async () => {
        (fetch as Mock).mockResolvedValueOnce({
          ok: true,
          text: async () => readRssFile(file),
        });
        const rss = new Rss(url);
        await rss.crawler();
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
