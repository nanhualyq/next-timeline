import { channelCrawler } from "@/app/actions";
import EditForm from "./EditForm";
import { channelTable } from "@/src/db/schema";

type Channel = typeof channelTable.$inferInsert;

export default function ChannelAdd() {
  const handleSubmit = async (channel: Channel) => {
    "use server";
    const res = await channelCrawler(channel);
    return res;
  };
  return <EditForm onSubmit={handleSubmit} />;
}
