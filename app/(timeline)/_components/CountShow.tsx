"use client";
import { useCountStore } from "./CountStore";
import { Badge } from "@/components/ui/badge";

interface Props {
  isHome?: boolean;
  isStar?: boolean;
  channel?: number;
  channels?: number[];
}

export default function CountShow({
  isHome,
  isStar,
  channel,
  channels,
}: Props) {
  const { star, unread } = useCountStore();
  let n = 0;
  if (isHome) {
    n = Object.values(unread).reduce((a, b) => a + b, 0);
  } else if (isStar) {
    n = star;
  } else if (channel) {
    n = unread[channel] || 0;
  } else if (channels) {
    n = channels.reduce((a, b) => a + (unread[b] || 0), 0);
  }
  if (!n) {
    return null;
  }
  return <Badge variant="outline">{n}</Badge>;
}
