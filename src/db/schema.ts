import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const channelTable = sqliteTable("channel", {
  id: int().primaryKey(),
  title: text().notNull(),
  link: text().notNull().unique(),
  description: text(),
  category: text(),
});

export const articleTable = sqliteTable("article", {
  id: int().primaryKey(),
  channel_id: int()
    .references(() => channelTable.id)
    .notNull(),
  title: text().notNull(),
  link: text().notNull().unique(),
  summary: text(),
  content: text(),
  pub_time: text(),
  cover: text(),
  read: integer({ mode: "boolean" }),
  star: integer({ mode: "boolean" }),
});
