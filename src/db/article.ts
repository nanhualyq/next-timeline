import { db } from ".";
import { articleTable } from "./schema";

export type ArticleInsert = typeof articleTable.$inferInsert;
export type ArticleSelect = typeof articleTable.$inferSelect;

export function insertArticles(articles: ArticleInsert[]) {
  return db.transaction(async (tx) => {
    for (const article of articles) {
      await tx.insert(articleTable).values(article).onConflictDoNothing();
    }
  });
}
