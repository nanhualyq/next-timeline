"use server";

import Rss from "@/src/crawler/Rss";
import { db } from "@/src/db";
import { ArticleSelect } from "@/src/db/article";
import { articleTable, channelTable } from "@/src/db/schema";
import { eq, getTableColumns } from "drizzle-orm";
import { omit } from "lodash-es";
import z from "zod";

export async function postFeed(o: unknown) {
  const schema = z.object({
    url: z.string(),
  });
  const { url } = schema.parse(o);
  const rss = new Rss(url);
  await rss.crawler();
  const channel = await rss.saveChannel();
  if (channel.lastInsertRowid) {
    await rss.saveArticles(Number(channel.lastInsertRowid));
  }
  return {
    success: true,
  };
}

export interface ArticleListItem {
  article: Omit<ArticleSelect, "content">;
  channel: typeof channelTable.$inferSelect | null;
}
export async function getArticleList(
  options: unknown = {}
): Promise<ArticleListItem[]> {
  const schema = z.object({
    limit: z.number().default(10),
    offset: z.number().default(0),
  });
  const { limit, offset } = schema.parse(options);

  return db
    .select({
      article: omit(getTableColumns(articleTable), ["content"]),
      channel: getTableColumns(channelTable),
    })
    .from(articleTable)
    .leftJoin(channelTable, eq(articleTable.channel_id, channelTable.id))
    .limit(limit)
    .offset(offset);
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
