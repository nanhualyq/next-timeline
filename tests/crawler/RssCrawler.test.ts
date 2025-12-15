import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import RssCrawler from "../../src/crawler/RssCrawler";
import { formatISO } from "date-fns";
import { crawlerFactor } from "@/src/crawler/factor";
import { db } from "@/src/db";
import * as articleDb from "@/src/db/article";

// 模擬 fetch API
const mockFetch = vi.fn();

describe("RssCrawler", () => {
  let rssCrawler: RssCrawler;

  beforeEach(() => {
    // 在每個測試案例之前，重新初始化 RssCrawler 實例
    rssCrawler = new RssCrawler({ link: "http://a.com", type: "" });
    // 將全局的 fetch 替換為我們的 mockFetch
    global.fetch = mockFetch;
  });

  afterEach(() => {
    // 在每個測試案例之後，清除所有的 mock
    vi.clearAllMocks();
    // 恢復全局的 fetch (如果需要，但通常在測試框架中會自動處理)
    // delete global.fetch;
  });

  describe("download", () => {
    it("should download and parse RSS feed correctly", async () => {
      const testUrl = "http://example.com/feed.xml";
      const mockXmlString = `
      <rss version="2.0">
        <channel>
          <title attr="1">Test Feed</title>
          <link>${testUrl}</link>
          <description>Test Description</description>
          <item>
            <title>Item 1</title>
            <link>http://example.com/item1</link>
          </item>
        </channel>
      </rss>
    `;
      const expectedParsedObject = {
        rss: {
          "@_version": "2.0",
          channel: {
            title: { "#text": "Test Feed", "@_attr": "1" },
            link: testUrl,
            description: "Test Description",
            item: { title: "Item 1", link: "http://example.com/item1" },
          },
        },
      };

      // 配置 mockFetch 以返回預期的響應
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(mockXmlString),
      });

      await rssCrawler.download();

      expect(rssCrawler.xmlObject).toEqual(expectedParsedObject);
    });
  });

  describe("parseChannel", () => {
    // 測試 RSS 2.0 格式，且值包含在 #text 屬性中
    it("should parse an RSS 2.0 feed channel correctly with #text values", () => {
      rssCrawler.xmlObject = {
        rss: {
          channel: {
            title: { "#text": "My RSS Feed Title" },
            link: { "#text": "http://example.com/rss" },
            description: { "#text": "A description of my RSS feed" },
            item: [],
          },
        },
      };

      const channelInfo = rssCrawler.parseChannel();

      expect(channelInfo).toEqual({
        type: "rss",
        title: "My RSS Feed Title",
        link: "http://a.com",
        description: "A description of my RSS feed",
        icon: "",
      });
    });

    // 測試 RSS 2.0 格式，且值為直接字串
    it("should parse an RSS 2.0 feed channel correctly with direct values", () => {
      rssCrawler.xmlObject = {
        rss: {
          channel: {
            title: "My RSS Feed Title Direct",
            link: "http://example.com/rss-direct",
            description: "A direct description of my RSS feed",
            item: [],
          },
        },
      };

      const channelInfo = rssCrawler.parseChannel();

      expect(channelInfo).toEqual({
        type: "rss",
        title: "My RSS Feed Title Direct",
        link: "http://a.com",
        description: "A direct description of my RSS feed",
        icon: "",
      });
    });

    // 測試 Atom 格式，使用 'feed' 根元素和 'subtitle' 作為描述
    it("should parse an Atom feed channel correctly using 'feed' and 'subtitle'", () => {
      rssCrawler.xmlObject = {
        feed: {
          title: { "#text": "My Atom Feed Title" },
          link: { "@href": "http://example.com/atom" }, // Atom 連結通常是帶有 href 屬性的物件
          subtitle: { "#text": "A subtitle for my Atom feed" },
          entry: [],
        },
      };

      const channelInfo = rssCrawler.parseChannel();

      expect(channelInfo).toEqual({
        type: "rss", // 注意：目前 parseChannel 硬編碼為 "rss" 類型
        title: "My Atom Feed Title",
        link: "http://a.com",
        description: "A subtitle for my Atom feed",
        icon: "",
      });
    });

    // 测试 Atom 格式，包含多个 link
    it("should parse an Atom feed channel correctly with multiple links", () => {
      rssCrawler.xmlObject = {
        feed: {
          title: { "#text": "My Atom Feed Title" },
          link: [
            { "@href": "http://example.com/atom-self", "@rel": "self" },
            {
              "@href": "http://example.com/atom-alternate",
              "@rel": "alternate",
            },
          ],
          subtitle: { "#text": "A subtitle for my Atom feed" },
          entry: [],
        },
      };

      const channelInfo = rssCrawler.parseChannel();

      expect(channelInfo).toEqual({
        type: "rss",
        title: "My Atom Feed Title",
        link: "http://a.com",
        description: "A subtitle for my Atom feed",
        icon: "",
      });
    });

    // 測試當 'description' 和 'subtitle' 都存在時，優先使用 'description'
    it("should prioritize 'description' over 'subtitle' if both exist in an Atom-like structure", () => {
      rssCrawler.xmlObject = {
        feed: {
          title: "Atom Title",
          link: "http://example.com/atom-both",
          description: "Explicit description",
          subtitle: "Fallback subtitle",
          entry: [],
        },
      };

      const channelInfo = rssCrawler.parseChannel();

      expect(channelInfo).toEqual({
        type: "rss",
        title: "Atom Title",
        link: "http://a.com",
        description: "Explicit description",
        icon: "",
      });
    });

    // 測試當描述（description 和 subtitle）都缺失時的處理
    it("should handle missing description and subtitle gracefully", () => {
      rssCrawler.xmlObject = {
        rss: {
          channel: {
            title: "Feed without description",
            link: "http://example.com/no-desc",
            item: [],
          },
        },
      };

      const channelInfo = rssCrawler.parseChannel();

      expect(channelInfo).toEqual({
        type: "rss",
        title: "Feed without description",
        link: "http://a.com",
        description: undefined, // 如果找不到，getXmlValue 會返回 undefined
        icon: "",
      });
    });

    // 測試當標題和連結都缺失時的處理
    it("should handle missing title and link gracefully", () => {
      rssCrawler.xmlObject = {
        rss: {
          channel: {
            description: "Only description",
            item: [],
          },
        },
      };

      expect(() => rssCrawler.parseChannel()).toThrow();
    });

    // 測試當 xmlObject 為空或格式不正確時的處理
    it("should return default values if xmlObject is empty or malformed", () => {
      rssCrawler.xmlObject = {}; // 空物件

      expect(() => rssCrawler.parseChannel()).toThrow();
    });

    // 測試當 xmlObject 既不包含 rss.channel 也不包含 feed 時的處理
    it("should return default values if xmlObject contains neither rss.channel nor feed", () => {
      rssCrawler.xmlObject = {
        someOtherRoot: {
          title: "Not a feed",
        },
      };

      expect(() => rssCrawler.parseChannel()).toThrow();
    });
  });

  describe("parseArticles", () => {
    it("should correctly parse articles from an RSS feed (rss.channel.item)", () => {
      const pubDate = new Date();
      rssCrawler.xmlObject = {
        rss: {
          channel: {
            item: [
              {
                title: "RSS Article 1",
                link: "http://example.com/rss-1",
                description: "Summary for RSS 1",
                "content:encoded":
                  '<p>Content for RSS 1</p><img src="http://example.com/cover1.jpg" />',
                pubDate: pubDate.toUTCString(),
                author: { name: "Author One" },
              },
              {
                title: "RSS Article 2",
                guid: "http://example.com/rss-2-guid",
                summary: "Summary for RSS 2",
                content: "Content for RSS 2",
                pubDate: pubDate.toUTCString(),
              },
            ],
          },
        },
      };

      const articles = rssCrawler.parseArticles();

      expect(articles).toHaveLength(2);

      // 測試第一篇文章
      expect(articles[0]).toEqual({
        channel_id: 0,
        title: "RSS Article 1",
        link: "http://example.com/rss-1",
        summary: "Summary for RSS 1",
        content:
          '<p>Content for RSS 1</p><img src="http://example.com/cover1.jpg" />',
        pub_time: formatISO(pubDate),
        cover: "http://example.com/cover1.jpg",
        author: "Author One",
      });

      // 測試第二篇文章（鏈接和內容的回退邏輯）
      expect(articles[1]).toEqual({
        channel_id: 0,
        title: "RSS Article 2",
        link: "http://example.com/rss-2-guid",
        summary: "Summary for RSS 2",
        content: "Content for RSS 2",
        pub_time: formatISO(pubDate),
        author: undefined, // 沒有作者
      });
    });

    it("should correctly parse articles from an Atom feed (feed.entry)", () => {
      const publishedDate = new Date();
      rssCrawler.xmlObject = {
        feed: {
          entry: [
            {
              title: "Atom Article 1",
              link: { "@_href": "http://example.com/atom-1" },
              summary: "Summary for Atom 1",
              content:
                '<div>Content for Atom 1 <img src="http://example.com/atom-cover1.png"></div>',
              published: publishedDate.toISOString(),
              author: { name: "Atom Author" },
            },
            {
              title: "Atom Article 2",
              link: "http://example.com/atom-2-nolinkattr", // 測試不帶 @_href 的情況
              description: "Description as summary fallback", // 測試 summary 回退
              published: publishedDate.toISOString(),
            },
          ],
        },
      };

      const articles = rssCrawler.parseArticles();

      expect(articles).toHaveLength(2);

      // 測試第一篇文章
      expect(articles[0]).toEqual({
        channel_id: 0,
        title: "Atom Article 1",
        link: "http://example.com/atom-1",
        summary: "Summary for Atom 1",
        content:
          '<div>Content for Atom 1 <img src="http://example.com/atom-cover1.png"></div>',
        pub_time: formatISO(publishedDate),
        cover: "http://example.com/atom-cover1.png",
        author: "Atom Author",
      });

      // 測試第二篇文章
      expect(articles[1]).toEqual({
        channel_id: 0,
        title: "Atom Article 2",
        link: "http://example.com/atom-2-nolinkattr",
        summary: "Description as summary fallback",
        content: "Description as summary fallback", // content 會回退到 description
        pub_time: formatISO(publishedDate),
        author: undefined,
      });
    });

    it("should return an empty array if no items or entries are found", () => {
      rssCrawler.xmlObject = {
        rss: {
          channel: {}, // 沒有 item
        },
      };
      expect(rssCrawler.parseArticles()).toEqual([]);

      rssCrawler.xmlObject = {
        feed: {}, // 沒有 entry
      };
      expect(rssCrawler.parseArticles()).toEqual([]);

      rssCrawler.xmlObject = {}; // 空對象
      expect(rssCrawler.parseArticles()).toEqual([]);
    });

    it("channel_id should equal channel.id", () => {
      const rssCrawler = new RssCrawler({ id: 1, link: "", type: "rss" });
      rssCrawler.xmlObject = {
        rss: {
          channel: {
            item: [
              {
                title: "RSS Article 1",
                link: "http://example.com/rss-1",
              },
            ],
          },
        },
      };

      const articles = rssCrawler.parseArticles();

      expect(articles[0].channel_id).toBe(1);
    });

    it("dc:creator", () => {
      rssCrawler.xmlObject = {
        rss: {
          channel: {
            item: [
              {
                title: "",
                link: "http://example.com/rss-1",
                "dc:creator": "test",
              },
            ],
          },
        },
      };

      const articles = rssCrawler.parseArticles();

      expect(articles[0].author).toBe("test");
    });
  });

  describe("saveChannel", () => {
    it("skip save to db when it exists", async () => {
      const p = { id: 1, type: "rss", link: "" };
      const factory = crawlerFactor(p);
      await factory.saveChannel();
      expect(factory.channel).toBe(p);
    });
    it("save to db when it is empty channel", async () => {
      const factory = crawlerFactor({ type: "rss", link: "http://a.com" });
      expect(factory.channel.id).toBe(undefined);
      const mockChannel = {
        title: "test",
        link: "http://a.com",
      };
      factory.parseChannel = vi.fn().mockReturnValueOnce(mockChannel);
      const spy = vi.spyOn(db, "insert").mockReturnValueOnce({
        // @ts-expect-error just for test
        values: async () => ({ lastInsertRowid: 1 }),
      });
      vi.spyOn(factory, "parseFavicon").mockReturnValueOnce(
        Promise.resolve("")
      );
      await factory.saveChannel();
      expect(factory.channel).toEqual({
        id: 1,
        ...mockChannel,
      });
      spy.mockRestore();
    });
  });

  describe("saveArticles", () => {
    it("abort when it is empty channel", async () => {
      const p = { type: "rss", link: "" };
      const factory = crawlerFactor(p);
      expect(() => factory.saveArticles()).toThrow();
    });
    it("save to db when it is not empty channel", async () => {
      const p = { id: 99, type: "rss", link: "" };
      const factory = crawlerFactor(p);
      const spy = vi.spyOn(articleDb, "insertArticles");
      await factory.saveArticles();
      expect(articleDb.insertArticles).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("parseFavicon", () => {
    it("works", async () => {
      const url = "https://cdn.oaistatic.com/assets/favicon-eex17e9e.ico";
      const html = `<head><link rel="icon" href="${url}" sizes="32x32"/></head>`;
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(html),
      });
      const icon = await rssCrawler.parseFavicon();
      expect(icon).toBe(url);
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
  });
});
