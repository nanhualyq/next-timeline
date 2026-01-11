import { db } from "@/src/db";
import { channelTable } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import EditForm from "../../add/EditForm";

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

  return <EditForm channel={res[0]} onSubmit={save} />;
}
