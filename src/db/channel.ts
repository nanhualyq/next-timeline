import { get } from "lodash-es";
import { db } from ".";
import { channelTable } from "./schema";
import { eq } from "drizzle-orm";

export async function addOrGetChannel(
  channel: typeof channelTable.$inferInsert
) {
  try {
    const res = await db.insert(channelTable).values(channel).returning();
    return res[0];
  } catch (error) {
    if (get(error, "cause.code") === "SQLITE_CONSTRAINT_UNIQUE") {
      const res = await db
        .select()
        .from(channelTable)
        .where(eq(channelTable.link, channel.link));
      return res[0];
    }
  }
}
