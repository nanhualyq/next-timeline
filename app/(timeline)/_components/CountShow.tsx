"use client";
import { Badge, BadgeProps } from "antd";
import { useCountStore } from "./CountStore";

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
  let size: BadgeProps["size"];
  if (isHome) {
    n = Object.values(unread).reduce((a, b) => a + b, 0);
  } else if (isStar) {
    n = star;
  } else if (channel) {
    n = unread[channel] || 0;
    size = "small";
  } else if (channels) {
    n = channels.reduce((a, b) => a + (unread[b] || 0), 0);
    size = "small";
  }
  if (!n) {
    return null;
  }
  return <Badge count={n} color="gray" title={n + ""} size={size} />;
}
