import { db } from ".";
import { articleTable } from "./schema";

type Article = typeof articleTable.$inferInsert;

export function insertArticles(articles: Article[]) {
  return db.transaction(async (tx) => {
    for (const article of articles) {
      await tx.insert(articleTable).values(article).onConflictDoNothing();
    }
  });
}
