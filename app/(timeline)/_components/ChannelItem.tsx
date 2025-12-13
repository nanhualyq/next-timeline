"use client";
import { channelTable } from "@/src/db/schema";
import { EllipsisOutlined } from "@ant-design/icons";
import { Dropdown, MenuProps } from "antd";
import Link from "next/link";
import styles from "./ChannelItem.module.css";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

interface Props {
  channel: typeof channelTable.$inferSelect;
}

const menuItems: MenuProps["items"] = ["Edit", "Refresh", "Delete"].map(
  (item) => ({
    key: item,
    label: item,
  })
);

export default function ChannelItem({ channel }: Props) {
  const sp = useSearchParams();
  const isFiltering = sp.get("channel") === channel.id + "";
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isFiltering) {
      const details = rootRef.current?.closest("details");
      if (details) {
        details.open = true;
      }
    }
  }, []);
  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${isFiltering ? styles.active : ""}`}
    >
      <Link href={`/?channel=${channel.id}`} style={{ flex: 1 }}>
        {channel.title}
      </Link>
      <Dropdown menu={{ items: menuItems }}>
        <a onClick={(e) => e.preventDefault()}>
          <EllipsisOutlined />
        </a>
      </Dropdown>
    </div>
  );
}
