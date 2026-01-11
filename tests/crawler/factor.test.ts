import { crawlerFactor } from "@/src/crawler/factor";
import RssCrawler from "@/src/crawler/RssCrawler";
import { describe, expect, it } from "vitest";

describe("crawlerFactor", () => {
  it("crawlerFactor works when type is rss", () => {
    const crawler = crawlerFactor({
      type: "rss",
      link: "http://fake.link",
    });
    expect(crawler).toBeInstanceOf(RssCrawler);
  });
  it("crawlerFactor works when type is html", () => {
    const crawler = crawlerFactor({
      type: "html",
      link: "http://fake.link",
    });
    expect(crawler.constructor.name).toBe("HtmlCrawler");
  });
  it("crawlerFactor abort when type is invalid", () => {
    expect(() =>
      crawlerFactor({
        type: "invalid",
        link: "http://fake.link",
      })
    ).toThrow();
  });
});
