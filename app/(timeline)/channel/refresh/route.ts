import { channelsCrawler } from "@/app/actions";

export async function GET() {
  channelsCrawler();
  return Response.json({ message: "channelCrawler is running" });
}
