import { db } from "@/src/db";
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
  await db.delete(channelTable);
});
afterEach(async () => {
  await db.delete(channelTable);
});

describe("channel table", () => {
  it("select", async () => {
    const res = await db.select().from(channelTable);
    expect(res).toHaveLength(0);
  });
  it("create one", async () => {
    const channel = await db.insert(channelTable).values({
      title: "test",
      link: "test",
      description: "test",
    });
    expect(channel.lastInsertRowid).toBeTruthy();
    const res = await db.select().from(channelTable);
    expect(res).toHaveLength(1);
  });
  it("link unique", async () => {
    const channel = await db.insert(channelTable).values({
      title: "test",
      link: "test",
    });
    expect(channel.lastInsertRowid).toBeTruthy();
    await expect(
      db.insert(channelTable).values({
        title: "test2",
        link: "test",
      })
    ).rejects.toThrow();
  });
});
