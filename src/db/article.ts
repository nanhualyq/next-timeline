import { db } from ".";
import { articleTable } from "./schema";

export type ArticleInsert = typeof articleTable.$inferInsert;
export type ArticleSelect = typeof articleTable.$inferSelect;

export function insertArticles(articles: ArticleInsert[]) {
  return db.transaction(async (tx) => {
    const results = [];
    for (const article of articles) {
      const res = await tx
        .insert(articleTable)
        .values(article)
        .onConflictDoNothing()
        .returning();
      results.push(...res);
    }
    return results;
  });
}
