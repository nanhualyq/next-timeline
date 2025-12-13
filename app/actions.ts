"use server";

import { inputChannel } from "@/src/crawler/CrawlerBase";
import { crawlerFactor } from "@/src/crawler/factor";
import { db } from "@/src/db";
import { ArticleSelect } from "@/src/db/article";
import { articleTable, channelTable } from "@/src/db/schema";
import { and, desc, eq, getTableColumns, SQLWrapper } from "drizzle-orm";
import { omit } from "lodash-es";
import z from "zod";

export async function postFeed(o: inputChannel) {
  const crawler = crawlerFactor(o);
  await crawler.download();
  await crawler.saveChannel();
  await crawler.saveArticles();
  return {
    success: true,
  };
}

export interface ArticleListItem {
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
    offset: z.number().default(0),
    star: z.string().optional(),
    read: z.string().optional(),
  });
  const { limit, offset, star, read } = schema.parse(options);

  const conditions: SQLWrapper[] = [];

  if (star) {
    conditions.push(eq(articleTable.star, true));
  }
  if (read !== "all") {
    conditions.push(eq(articleTable.read, read === "old"));
  }

  const list = await db
    .select({
      article: omit(getTableColumns(articleTable), ["content"]),
      channel: getTableColumns(channelTable),
    })
    .from(articleTable)
    .leftJoin(channelTable, eq(articleTable.channel_id, channelTable.id))
    .limit(limit + 1)
    .offset(offset)
    .where(and(...conditions))
    .orderBy(desc(articleTable.pub_time));

  return {
    list,
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
