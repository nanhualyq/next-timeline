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
  await db.insert(channelTable).values({
    title: "test",
    link: "test",
  });
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
