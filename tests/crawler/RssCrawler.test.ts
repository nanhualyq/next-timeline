import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import RssCrawler from "../../src/crawler/RssCrawler";
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
            description: {
              "#text": "Test Description",
            },
            item: {
              link: {
                "#text": "http://example.com/item1",
              },
              title: {
                "#text": "Item 1",
              },
            },
            link: {
              "#text": "http://example.com/feed.xml",
            },
            title: {
              "#text": "Test Feed",
              "@_attr": "1",
            },
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
    it("rss.channel.item should be an array when only one item", async () => {
      const mockXmlString = `
      <rss version="2.0">
        <channel>
          <title attr="1">Test Feed</title>
          <link>url</link>
          <description>Test Description</description>
          <item>
            <title>Item 1</title>
            <link>http://example.com/item1</link>
          </item>
        </channel>
      </rss>
    `;

      // 配置 mockFetch 以返回預期的響應
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(mockXmlString),
      });

      await rssCrawler.download();

      expect(rssCrawler.items).toBeInstanceOf(Array);
    });
    it("atom.entry should be an array when only one entry", async () => {
      const mockXmlString = `
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>Example Feed</title>
        <link href="http://example.org/" rel="self"/>
        <updated>2003-12-13T18:30:02Z</updated>
        <author>
          <name>John Doe</name>
        </author>
        <id>urn:uuid:60a76c80-d399-11d9-b93C-000389bca9fa</id>
        <entry>
          <title>Atom Item 1</title>
          <link href="http://example.org/atom-item1"/>
          <id>urn:uuid:1225c695-d399-11d9-b91C-000389bca9fa</id>
          <updated>2003-12-13T18:30:02Z</updated>
          <summary>This is a summary of Atom Item 1.</summary>
        </entry>
      </feed>
    `;

      // 配置 mockFetch 以返回預期的響應
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(mockXmlString),
      });

      await rssCrawler.download();

      expect(rssCrawler.items).toBeInstanceOf(Array);
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
          title: { "#text": "Atom Title" },
          link: { "#text": "http://example.com/atom-both" },
          description: { "#text": "Explicit description" },
          subtitle: { "#text": "Fallback subtitle" },
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
            title: { "#text": "Feed without description" },
            link: { "#text": "http://example.com/no-desc" },
            item: [],
          },
        },
      };

      const channelInfo = rssCrawler.parseChannel();

      expect(channelInfo).toEqual({
        type: "rss",
        title: "Feed without description",
        link: "http://a.com",
        description: undefined,
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
                title: { "#text": "RSS Article 1" },
                link: { "#text": "http://example.com/rss-1" },
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
                title: { "#text": "" },
                link: { "#text": "http://example.com/rss-1" },
                "dc:creator": { "#text": "test" },
              },
            ],
          },
        },
      };

      const articles = rssCrawler.parseArticles();

      expect(articles[0].author).toBe("test");
    });

    it("content should be a string", async () => {
      const mockXmlString = `
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
      <channel>
          <title>吴晓波</title>
          <atom:link href="https://wuxiaobo.blog.caixin.com/feed" rel="self" type="application/rss+xml"/>
          <link>https://wuxiaobo.blog.caixin.com</link>
          <description>吴晓波</description>
          <item>
            <title>书籍让我的居室和生活拥挤不堪&nbsp;&nbsp;</title>
            <link>https://wuxiaobo.blog.caixin.com/archives/71389</link>
            <pubDate>Fri, 16 May 2014 23:49:00 GMT</pubDate>
            <dc:creator>吴晓波</dc:creator>
            <guid isPermaLink="false">https://wuxiaobo.blog.caixin.com/archives/71389</guid>
            <description>
            <a href="https://wuxiaobo.blog.caixin.com/archives/71389" target="_blank">阅读全文</a>
            </description>
          </item>
        </channel>
      </rss>
    `;

      // 配置 mockFetch 以返回預期的響應
      mockFetch.mockResolvedValueOnce({
        text: () => Promise.resolve(mockXmlString),
      });

      await rssCrawler.download();

      const articles = rssCrawler.parseArticles();
      expect(articles[0].content).toBeTypeOf("string");
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
      const spy = vi
        .spyOn(rssCrawler, "parseArticleLink")
        .mockReturnValueOnce(origin + "/a/b/c.html");
      const icon = await rssCrawler.parseFavicon();
      expect(icon).toBe(origin + "/favicon.ico");
      spy.mockReset();
    });
  });

  describe("parseArticleSummay", () => {
    it("summary", () => {
      const text = rssCrawler.parseArticleSummay(
        {
          summary: {
            "#text": "test",
          },
        },
        ""
      );
      expect(text).toBe("test");
    });
    it("description when has content:encoded", () => {
      const text = rssCrawler.parseArticleSummay(
        {
          summary: {
            "#text": "summary",
          },
          "content:encoded": {
            "#text": "content",
          },
          description: {
            "#text": "description",
          },
        },
        ""
      );
      expect(text).toBe("description");
    });
    it("content is plain text", () => {
      const text = rssCrawler.parseArticleSummay({}, "text");
      expect(text).toBe("text");
    });
    it("description is html text", () => {
      const text = rssCrawler.parseArticleSummay(
        {
          "content:encoded": {
            "#text": "content",
          },
          description: {
            "#text": "<h1>text</h1>",
          },
        },
        ""
      );
      expect(text).toBe("text");
    });
    it("content is html text", () => {
      const text = rssCrawler.parseArticleSummay({}, "<h1>text</h1>");
      expect(text).toBe("text");
    });
    it("content > 200 chars", () => {
      const content = "1".repeat(200);
      const text = rssCrawler.parseArticleSummay({}, content + "2");
      expect(text).toBe(content);
    });
  });

  describe("parseArticleCover", () => {
    it("from content html", () => {
      rssCrawler.parseXml(`<feed>
        <entry>
          <content type="html"><![CDATA[<div><img loading="lazy" class="u-photo" src="https://cdn.arstechnica.net/wp-content/uploads/2024/11/GettyImages-1691376215-1152x648.jpg" alt="cdn.arstechnica.net image"></div><div>Meta’s star AI scientist Yann LeCun plans to leave for own startup (<a href="https://arstechnica.com/ai/2025/11/metas-star-ai-scientist-yann-lecun-plans-to-leave-for-own-startup/">arstechnica.com</a>)</div><footer><a href="https://i.buzzing.cc/arstechnica/posts/2025/46/en_rss_2025_11_12__arstechnica-com--ai-2025-11-metas-star-ai-scientist-yann-lecun-plans-to-leave-for-own-startup-/"><time class="dt-published published" datetime="2025-11-12T17:14:16.000Z">11-13</time></a>&nbsp;&nbsp;</footer>]]></content>
        </entry>
      </feed>`);
      const cover = rssCrawler.parseArticleCover(
        {},
        rssCrawler.parseArticleContent(rssCrawler.items[0])
      );
      expect(cover).toBe(
        "https://cdn.arstechnica.net/wp-content/uploads/2024/11/GettyImages-1691376215-1152x648.jpg"
      );
    });
    it("from media:thumbnail", () => {
      rssCrawler.parseXml(`<rss>
        <channel>
          <item>
            <title>芬蘭小姐「拉眼角」照片掀起的種族議題風波</title>
            <description>
            「拉眼角」動作在國際社會中普遍被視為對亞裔族群的刻板印象模仿，事件在當地政界引發迴響，有右翼芬蘭人黨議員在社交平台發布自己拉眼角的照片，再度引發爭議。
            </description>
            <link>
            https://www.bbc.com/zhongwen/articles/cd0k33ynv2no/trad?at_medium=RSS&at_campaign=rss
            </link>
            <pubDate>Tue, 16 Dec 2025 09:22:59 GMT</pubDate>
            <media:thumbnail width="240" height="163" url="https://ichef.bbci.co.uk/ace/ws/240/cpsprodpb/6eec/live/fdb55250-da46-11f0-a8dc-93c15fe68710.jpg"/>
          </item>
        </channel>
        </rss>`);
      const cover = rssCrawler.parseArticleCover(rssCrawler.items[0], "");
      expect(cover).toBe(
        "https://ichef.bbci.co.uk/ace/ws/240/cpsprodpb/6eec/live/fdb55250-da46-11f0-a8dc-93c15fe68710.jpg"
      );
    });
  });

  describe("youtube", () => {
    const xml = `<feed>
           <entry>
            <id>yt:video:SpRPuS5MEwI</id>
            <yt:videoId>SpRPuS5MEwI</yt:videoId>
            <yt:channelId>UCeUJO1H3TEXu2syfAAPjYKQ</yt:channelId>
            <title>Vision Pro很酷，但根本不需要买新款！</title>
            <link rel="alternate" href="https://www.youtube.com/watch?v=SpRPuS5MEwI"/>
            <author>
            <name>极客湾Geekerwan</name>
            <uri>https://www.youtube.com/channel/UCeUJO1H3TEXu2syfAAPjYKQ</uri>
            </author>
            <published>2025-11-01T17:19:20+00:00</published>
            <updated>2025-11-02T10:42:52+00:00</updated>
            <media:group>
              <media:title>Vision Pro很酷，但根本不需要买新款！</media:title>
              <media:content url="https://www.youtube.com/v/SpRPuS5MEwI?version=3" type="application/x-shockwave-flash" width="640" height="390"/>
              <media:thumbnail url="https://i4.ytimg.com/vi/SpRPuS5MEwI/hqdefault.jpg" width="480" height="360"/>
              <media:description>刚拿到M5 Vision Pro的时候，我觉得他的提升好大！哪哪儿都更流畅更好用了。结果我又拿出已经吃灰的老Vision Pro才发现，原来都是新系统的功劳……这个M5的换代升级，只能说，如升。那么2025年，Vision Pro到底能做些什么呢？</media:description>
              <media:community>
                <media:starRating count="1913" average="5.00" min="1" max="5"/>
                <media:statistics views="92675"/>
              </media:community>
            </media:group>
          </entry>
        </feed>`;
    it("get cover", () => {
      rssCrawler.parseXml(xml);
      const cover = rssCrawler.parseArticleCover(rssCrawler.items[0], "");
      expect(cover).toBe("https://i4.ytimg.com/vi/SpRPuS5MEwI/hqdefault.jpg");
    });
    it("get content", () => {
      rssCrawler.parseXml(xml);
      const content = rssCrawler.parseArticleContent(rssCrawler.items[0]);
      expect(content).toBe(
        "刚拿到M5 Vision Pro的时候，我觉得他的提升好大！哪哪儿都更流畅更好用了。结果我又拿出已经吃灰的老Vision Pro才发现，原来都是新系统的功劳……这个M5的换代升级，只能说，如升。那么2025年，Vision Pro到底能做些什么呢？"
      );
    });
  });

  describe("parseArticleContent", () => {
    it("works for normal", () => {
      const content = rssCrawler.parseArticleContent({
        content: { "#text": `<h1>123</h1>` },
      });
      expect(content).toBe("<h1>123</h1>");
    });
    it("avoid xss code of script", () => {
      const content = rssCrawler.parseArticleContent({
        content: { "#text": `<script>alert(1)</script>` },
      });
      expect(content).toBe("");
    });
    it("avoid xss code of onerror", () => {
      const content = rssCrawler.parseArticleContent({
        content: { "#text": `<img src="x" onerror="alert(1)">` },
      });
      expect(content).toBe(`<img src="x" />`);
    });
    it("img should has src", () => {
      const content = rssCrawler.parseArticleContent({
        content: { "#text": `<img src="http://a.com/1.jpg" />` },
      });
      expect(content).toBe(`<img src="http://a.com/1.jpg" />`);
    });
    it("avoid xss code of javascript:", () => {
      const content = rssCrawler.parseArticleContent({
        content: { "#text": `<a href="javascript:alert(1)">click</a>` },
      });
      expect(content).toBe(`<a>click</a>`);
    });
  });
});
