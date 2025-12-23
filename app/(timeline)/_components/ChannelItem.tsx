"use client";
import { channelTable } from "@/src/db/schema";
import styles from "./ChannelItem.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  channelCrawler,
  deleteArticlesByChannel,
  deleteChannel,
} from "@/app/actions";
import ChannelTitle from "./ChannelTitle";
import CountShow from "./CountShow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDots,
  IconEdit,
  IconRefresh,
  IconTrashX,
  IconWashDryOff,
} from "@tabler/icons-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface Props {
  channel: typeof channelTable.$inferSelect;
}

export default function ChannelItem({ channel }: Props) {
  const sp = useSearchParams();
  const isFiltering = sp.get("channel") === channel.id + "";
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isFiltering) {
      const details = rootRef.current?.closest("details");
      if (details) {
        details.open = true;
      }
    }
  }, [isFiltering]);

  async function handleDelete(action: string) {
    const isDelete = action === "Delete";
    const title = isDelete
      ? "Delete this channel?"
      : "Delete all articles of this channel";
    await Swal.fire({
      title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: action,
      cancelButtonText: "Cancel",
    });
    toast.promise(
      (isDelete ? deleteChannel : deleteArticlesByChannel)(channel.id),
      {
        loading: `${action} is in progress...`,
        success: () => {
          router.replace("/");
          location.reload();
          return "Successed!";
        },
        error: "Error",
      }
    );
  }

  function handleRefresh() {
    toast.promise(channelCrawler(channel), {
      loading: "Channel is refresh...",
      success: () => {
        router.replace(`?channel=${channel.id}`);
        location.reload();
        return "Successed!";
      },
      error: "Error",
    });
  }

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${isFiltering ? styles.active : ""}`}
    >
      <ChannelTitle channel={channel} style={{ flex: 1 }} />
      <CountShow channel={channel.id} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconDots />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-16" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push(`/channel/${channel.id}/edit`)}
            >
              <IconEdit />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRefresh}>
              <IconRefresh />
              Refresh
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => handleDelete("Delete")}
            >
              <IconTrashX />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => handleDelete("Empty")}
            >
              <IconWashDryOff />
              Empty
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
