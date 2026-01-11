import { sql } from "drizzle-orm";
import { int, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const channelTable = sqliteTable("channel", {
  id: int().primaryKey(),
  type: text({ enum: ["rss", 'html'] }).notNull(),
  title: text().notNull(),
  link: text().notNull().unique(),
  description: text(),
  category: text(),
  icon: text(),
  items_code: text(),
});

export const articleTable = sqliteTable("article", {
  id: int().primaryKey(),
  channel_id: int()
    .references(() => channelTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  title: text().notNull(),
  link: text().notNull().unique(),
  summary: text(),
  content: text(),
  pub_time: text(),
  cover: text(),
  read: integer({ mode: "boolean" }).default(false),
  star: integer({ mode: "boolean" }).default(false),
  author: text(),
});

export const crawlerLogTable = sqliteTable("crawler_log", {
  id: int().primaryKey(),
  channel_id: int()
    .references(() => channelTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  timestamp: text().default(sql`(CURRENT_TIMESTAMP)`),
  status: text({ enum: ["success", "error"] }).notNull(),
  result: text(),
});
