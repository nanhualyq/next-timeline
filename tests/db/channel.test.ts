import { deleteChannel } from "@/app/actions";
import { db } from "@/src/db";
import { insertArticles } from "@/src/db/article";
import { addOrGetChannel } from "@/src/db/channel";
import { channelTable } from "@/src/db/schema";
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
});
afterAll(async () => {
  execSync("rm test.db");
});
beforeEach(async () => {
  await db.insert(channelTable).values(makeChannel());
});
afterEach(async () => {
  await db.delete(channelTable);
});

function makeChannel(): typeof channelTable.$inferInsert {
  return {
    title: "titile",
    link: "link",
    type: "rss",
  };
}

describe("channel table", () => {
  it("link unique", async () => {
    await expect(
      db.insert(channelTable).values(makeChannel())
    ).rejects.toThrow();
  });
  it("delete one with no articles", async () => {
    await deleteChannel(1);
    await expect(db.select().from(channelTable)).resolves.toHaveLength(0);
  });
  it("delete one with some articles", async () => {
    await insertArticles([
      {
        link: "",
        title: "",
        channel_id: 1,
      },
    ]);
    try {
      await deleteChannel(1);
    } catch (error) {
      console.log(error);
    }
    await expect(db.select().from(channelTable)).resolves.toHaveLength(0);
  });
});

describe("addOrGetChannel", () => {
  it("add one", async () => {
    const channel = makeChannel();
    channel.link = "http://a.com";
    const res = await addOrGetChannel(channel);
    expect(res?.id).toBeTypeOf("number");
  });
  it("get one when link is repeat", async () => {
    const channel = makeChannel();
    channel.link = "http://a.com";
    const res = await addOrGetChannel(channel);
    const res2 = await addOrGetChannel(channel);
    expect(res?.id).toBe(res2?.id);
  });
});
