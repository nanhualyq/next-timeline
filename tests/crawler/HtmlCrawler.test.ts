import HtmlCrawler from "@/src/crawler/HtmlCrawler";
import { describe, expect, it } from "vitest";

describe("HtmlCrawler", () => {
  describe("parseArticles", () => {
    it("should return an array", () => {
      const C = new HtmlCrawler({
        link: "http://example.com",
        items_code: "return []",
      });
      C.parseHtml("");
      const arr = C.parseArticles();
      expect(arr).toBeInstanceOf(Array);
    });
    it("should return an array of article titles", () => {
      const C = new HtmlCrawler({
        id: 1,
        link: "http://example.com",
      });
      C.parseHtml("<ul><li>1</li><li>2</li><li>3</li></ul>");
      C.channel.items_code =
        "return Array.from(document.querySelectorAll('li')).map(li => ({title: li.textContent, link: ''}))";
      const arr = C.parseArticles();
      expect(arr).toMatchObject([
        { title: "1" },
        { title: "2" },
        { title: "3" },
      ]);
    });
  });
});
