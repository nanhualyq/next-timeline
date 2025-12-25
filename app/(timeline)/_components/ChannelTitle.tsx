import { channelTable } from "@/src/db/schema";
import { IconSquare } from "@tabler/icons-react";
import Link from "next/link";
import { CSSProperties, MouseEventHandler } from "react";

interface Props {
  style?: CSSProperties;
  onClick?: MouseEventHandler;
  channel: typeof channelTable.$inferSelect;
}

export default function ChannelTitle({ channel, style, onClick }: Props) {
  return (
    <Link
      href={`/?channel=${channel.id}`}
      style={{ ...style, display: "flex", gap: "4px", alignItems: "center" }}
      onClick={onClick}
    >
      {channel.icon ? (
        <img src={channel.icon} width={16} height={16} />
      ) : (
        <IconSquare size={16} />
      )}
      {channel.title}
    </Link>
  );
}
