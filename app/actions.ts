"use server";

import { inputChannel } from "@/src/crawler/CrawlerBase";
import { crawlerFactor } from "@/src/crawler/factor";
import { db } from "@/src/db";
import { ArticleSelect } from "@/src/db/article";
import { articleTable, channelTable } from "@/src/db/schema";
import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  lt,
  or,
  sql,
  SQLWrapper,
} from "drizzle-orm";
import { omit } from "lodash-es";
import z from "zod";

export async function channelCrawler(o: inputChannel) {
  const crawler = crawlerFactor(o);
  await crawler.start();
  return {
    success: true,
    id: crawler.channel.id,
  };
}

export async function channelsCrawler() {
  const channels = await db.select().from(channelTable);
  for (const channel of channels) {
    try {
      await channelCrawler(channel);
    } catch (error) {
      console.error(error);
    }
  }
  return {
    success: true,
  };
}

export async function deleteChannel(id: number) {
  await db.delete(channelTable).where(eq(channelTable.id, id));
  return {
    success: true,
  };
}

interface ArticleListItem {
  article: Omit<ArticleSelect, "content">;
  channel: typeof channelTable.$inferSelect | null;
}
export interface ArticleListReturn {
  list: ArticleListItem[];
  hasMore: boolean;
}
export async function getArticleList(
  options: unknown = {}
): Promise<ArticleListReturn> {
  const schema = z.object({
    limit: z.number().default(50),
    lastId: z.number().optional(),
    lastPubtime: z.string().optional(),
    star: z.string().optional(),
    read: z.string().optional(),
    channel: z.string().optional(),
  });
  const { limit, lastId, lastPubtime, star, read, channel } =
    schema.parse(options);

  const conditions: SQLWrapper[] = [];

  if (lastId && lastPubtime) {
    conditions.push(
      or(
        lt(articleTable.pub_time, lastPubtime),
        and(eq(articleTable.pub_time, lastPubtime), lt(articleTable.id, lastId))
      )!
    );
  }
  if (star) {
    conditions.push(eq(articleTable.star, true));
  }
  if (read !== "all") {
    conditions.push(eq(articleTable.read, read === "old"));
  }
  if (channel) {
    conditions.push(eq(articleTable.channel_id, +channel));
  }

  const list = await db
    .select({
      article: omit(getTableColumns(articleTable), ["content"]),
      channel: getTableColumns(channelTable),
    })
    .from(articleTable)
    .leftJoin(channelTable, eq(articleTable.channel_id, channelTable.id))
    .limit(limit + 1)
    .where(and(...conditions))
    .orderBy(desc(articleTable.pub_time), desc(articleTable.id));

  return {
    list: list.slice(0, limit),
    hasMore: list.length > limit,
  };
}

export async function getArticle(id: number) {
  return (
    await db
      .select()
      .from(articleTable)
      .where(eq(articleTable.id, id))
      .leftJoin(channelTable, eq(articleTable.channel_id, channelTable.id))
  )[0];
}

export async function patchArticle({ id, ...rest }: Partial<ArticleSelect>) {
  if (!id) {
    throw Error("id not found");
  }
  await db.update(articleTable).set(rest).where(eq(articleTable.id, id));
}

export async function deleteArticlesByChannel(channel_id: number) {
  const res = await db
    .delete(articleTable)
    .where(eq(articleTable.channel_id, channel_id));
  return {
    success: !!res.lastInsertRowid,
  };
}

export async function readArticles(ids: number[]) {
  await db
    .update(articleTable)
    .set({ read: true })
    .where(inArray(articleTable.id, ids));
  return {
    success: true,
  };
}
export async function readAllArticles() {
  await db.update(articleTable).set({ read: true });
  return {
    success: true,
  };
}

export async function countUnread() {
  const res = await db
    .select({
      channel: articleTable.channel_id,
      count: sql<number>`cast(count(${articleTable.id}) as int)`,
    })
    .from(articleTable)
    .where(eq(articleTable.read, false))
    .groupBy(articleTable.channel_id);
  return res.reduce((acc, cur) => {
    acc[cur.channel] = cur.count;
    return acc;
  }, {} as Record<number, number>);
}

export async function countStar() {
  const count = await db.$count(articleTable, eq(articleTable.star, true));
  return {
    count,
  };
}
