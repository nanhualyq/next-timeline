import { crawlerFactor } from "@/src/crawler/factor";
import RssCrawler from "@/src/crawler/RssCrawler";
import { describe, expect, it } from "vitest";

describe("crawlerFactor", () => {
  it("crawlerFactor works when type is rss", () => {
    const crawler = crawlerFactor({
      type: "rss",
      link: "",
    });
    expect(crawler).toBeInstanceOf(RssCrawler);
  });
  it("crawlerFactor abort when type is invalid", () => {
    expect(() =>
      crawlerFactor({
        type: "invalid",
        link: "",
      })
    ).toThrow();
  });
});
