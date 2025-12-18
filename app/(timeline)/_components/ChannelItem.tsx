"use client";
import { channelTable } from "@/src/db/schema";
import {
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  RestOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Dropdown, MenuProps, Modal } from "antd";
import styles from "./ChannelItem.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  channelCrawler,
  deleteArticlesByChannel,
  deleteChannel,
} from "@/app/actions";
import useMessage from "antd/es/message/useMessage";
import ChannelTitle from "./ChannelTitle";
import CountShow from "./CountShow";

interface Props {
  channel: typeof channelTable.$inferSelect;
}

const menuItems: MenuProps["items"] = [
  {
    key: "Edit",
    label: "Edit",
    icon: <EditOutlined />,
  },
  {
    key: "Refresh",
    label: "Refresh",
    icon: <SyncOutlined />,
  },
  {
    key: "Delete",
    label: "Delete",
    danger: true,
    icon: <DeleteOutlined />,
  },
  {
    key: "Empty",
    label: "Empty",
    danger: true,
    icon: <RestOutlined />,
  },
];

export default function ChannelItem({ channel }: Props) {
  const sp = useSearchParams();
  const isFiltering = sp.get("channel") === channel.id + "";
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [messageApi, contextHolder] = useMessage();

  useEffect(() => {
    if (isFiltering) {
      const details = rootRef.current?.closest("details");
      if (details) {
        details.open = true;
      }
    }
  }, [isFiltering]);

  function handleAction(cb: () => Promise<unknown>, target = "/") {
    messageApi.open({
      type: "loading",
      content: "Action in progress..",
      duration: 0,
    });
    cb()
      .then(() => {
        router.replace(target);
        location.reload();
      })
      .catch((error) => {
        const modal = Modal.error({
          content: error + "",
          onOk() {
            modal.destroy();
          },
        });
      })
      .finally(() => {
        messageApi.destroy();
      });
  }

  function handleDelete(action: string) {
    const isDelete = action === "Delete";
    const title = isDelete
      ? "Delete this channel?"
      : "Delete all articles of this channel";
    Modal.confirm({
      title,
      onOk() {
        handleAction(() => {
          return (isDelete ? deleteChannel : deleteArticlesByChannel)(
            channel.id
          );
        });
      },
    });
  }

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "Edit") {
      router.push(`/channel/${channel.id}/edit`);
    } else if (["Delete", "Empty"].includes(key)) {
      handleDelete(key);
    } else if (key === "Refresh") {
      handleAction(() => channelCrawler(channel), `?channel=${channel.id}`);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${isFiltering ? styles.active : ""}`}
    >
      {contextHolder}
      <ChannelTitle channel={channel} style={{ flex: 1 }} />
      <CountShow channel={channel.id} />
      <Dropdown
        menu={{ items: menuItems, onClick: onMenuClick }}
        trigger={["click"]}
      >
        <a onClick={(e) => e.preventDefault()}>
          <EllipsisOutlined style={{ padding: ".5rem" }} />
        </a>
      </Dropdown>
    </div>
  );
}
