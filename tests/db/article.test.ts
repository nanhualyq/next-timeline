import {
  countStar,
  countUnread,
  deleteArticlesByChannel,
  getArticleList,
  readAllArticles,
  readArticles,
} from "@/app/actions";
import { db } from "@/src/db";
import { insertArticles } from "@/src/db/article";
import { articleTable, channelTable } from "@/src/db/schema";
import { execSync } from "child_process";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

beforeAll(async () => {
  execSync("npx drizzle-kit push");
  await db.delete(channelTable);
  await db.insert(channelTable).values([
    {
      title: "test",
      link: "test",
      type: "rss",
    },
    {
      title: "test2",
      link: "test2",
      type: "rss",
    },
  ]);
});
afterAll(async () => {
  execSync("rm test.db");
});

beforeEach(async () => {
  await db.delete(articleTable);
});
afterEach(async () => {
  await db.delete(articleTable);
});

describe("article table", () => {
  describe("getArticleList", () => {
    it("sort by pub_time desc", async () => {
      await insertArticles([
        {
          channel_id: 1,
          title: "test",
          link: "test",
          pub_time: "2024-01-01T00:00:00.000Z",
        },
        {
          channel_id: 1,
          title: "test2",
          link: "test2",
          pub_time: "2024-01-02T00:00:00.000Z",
        },
      ]);
      const res = await getArticleList();
      expect(res.list[0].article.title).toBe("test2");
    });
    it("filter by channel", async () => {
      await insertArticles([
        {
          channel_id: 1,
          title: "test",
          link: "test",
        },
        {
          channel_id: 2,
          title: "test2",
          link: "test2",
        },
      ]);
      const res = await getArticleList({ channel: "2" });
      expect(res.list[0].article.title).toBe("test2");
    });
  });

  describe("insertArticles", () => {
    it("insertArticles only one", async () => {
      await insertArticles([{ channel_id: 1, title: "test", link: "test" }]);
      const res = await db.select().from(articleTable);
      expect(res).toHaveLength(1);
    });
    it("insertArticles many", async () => {
      await insertArticles([
        { channel_id: 1, title: "test", link: "test" },
        { channel_id: 1, title: "test2", link: "test2" },
      ]);
      expect(await db.select().from(articleTable)).toHaveLength(2);
    });
    it("insert same link should skip", async () => {
      await expect(
        insertArticles([
          { channel_id: 1, title: "test", link: "test" },
          { channel_id: 1, title: "test2", link: "test" },
        ])
      ).resolves.not.toThrow();
      expect(await db.select().from(articleTable)).toHaveLength(1);
    });
  });

  describe("deleteArticlesByChannel", () => {
    it("works", async () => {
      await insertArticles([
        { channel_id: 1, title: "test", link: "test" },
        { channel_id: 1, title: "test2", link: "test2" },
      ]);
      await deleteArticlesByChannel(2);
      expect(await db.select().from(articleTable)).toHaveLength(2);
      await deleteArticlesByChannel(1);
      expect(await db.select().from(articleTable)).toHaveLength(0);
    });
  });

  describe("readArticles", () => {
    it("works", async () => {
      await insertArticles([
        { channel_id: 1, title: "test", link: "test" },
        { channel_id: 1, title: "test2", link: "test2" },
      ]);
      expect(await db.select().from(articleTable)).toMatchObject([
        {
          read: false,
        },
        {
          read: false,
        },
      ]);
      await readArticles([1, 2]);
      expect(await db.select().from(articleTable)).toMatchObject([
        {
          read: true,
        },
        {
          read: true,
        },
      ]);
    });
  });

  describe("readAllArticles", () => {
    it("works", async () => {
      await insertArticles([
        { channel_id: 1, title: "test", link: "test" },
        { channel_id: 1, title: "test2", link: "test2" },
      ]);
      expect(await db.select().from(articleTable)).toMatchObject([
        {
          read: false,
        },
        {
          read: false,
        },
      ]);
      await readAllArticles();
      expect(await db.select().from(articleTable)).toMatchObject([
        {
          read: true,
        },
        {
          read: true,
        },
      ]);
    });
  });

  describe("countUnread", () => {
    it("works", async () => {
      await insertArticles([
        { channel_id: 1, title: "test", link: "test" },
        { channel_id: 2, title: "test2", link: "test2" },
      ]);
      const res = await countUnread();
      expect(res).toMatchObject({
        1: 1,
        2: 1,
      });
    });
  });

  describe("countStar", () => {
    it("works empty", async () => {
      await insertArticles([
        { channel_id: 1, title: "test", link: "test" },
        { channel_id: 2, title: "test2", link: "test2" },
      ]);
      const res = await countStar();
      expect(res).toMatchObject({ count: 0 });
    });
    it("works has stars", async () => {
      await insertArticles([
        { channel_id: 1, title: "test", link: "test", star: true },
        { channel_id: 2, title: "test2", link: "test2", star: true },
      ]);
      const res = await countStar();
      expect(res).toMatchObject({ count: 2 });
    });
  });
});
