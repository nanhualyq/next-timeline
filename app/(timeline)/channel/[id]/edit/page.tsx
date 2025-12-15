import { db } from "@/src/db";
import ChannelEditForm from "./EditForm";
import { channelTable } from "@/src/db/schema";
import { eq } from "drizzle-orm";

interface Props {
  params: {
    id: string;
  };
}

export default async function ChannelEdit({ params }: Props) {
  const { id } = await params;
  const res = await db
    .select()
    .from(channelTable)
    .where(eq(channelTable.id, +id));

  async function save({ id, ...rest }: (typeof res)[0]) {
    "use server";
    await db.update(channelTable).set(rest).where(eq(channelTable.id, +id));
  }

  return <ChannelEditForm channel={res[0]} save={save} />;
}
