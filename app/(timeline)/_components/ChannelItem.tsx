"use client";
import { channelTable } from "@/src/db/schema";
import { useRouter, useSearchParams } from "next/navigation";
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
  IconHeartRateMonitor,
  IconRefresh,
  IconTrashX,
  IconWashDryOff,
} from "@tabler/icons-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Props {
  channel: typeof channelTable.$inferSelect;
}

export default function ChannelItem({ channel }: Props) {
  const sp = useSearchParams();
  const isFiltering = sp.get("channel") === channel.id + "";
  const router = useRouter();

  async function handleDelete(action: string) {
    const isDelete = action === "Delete";
    const title = isDelete
      ? "Delete this channel?"
      : "Delete all articles of this channel";
    const res = await Swal.fire({
      title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: action,
      cancelButtonText: "Cancel",
    });
    if (!res.isConfirmed) {
      return;
    }
    toast.promise(
      (isDelete ? deleteChannel : deleteArticlesByChannel)(channel.id),
      {
        loading: `${action} is in progress...`,
        success: () => {
          if (isDelete) {
            router.refresh();
          } else {
            router.replace(`?from_channel=${Date.now()}`);
          }
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
        router.replace(`?from_channel=${Date.now()}`);
        return "Successed!";
      },
      error: "Error",
    });
  }

  return (
    <SidebarMenuItem key={channel.id}>
      <SidebarMenuButton isActive={isFiltering}>
        <ChannelTitle channel={channel} />
        <CountShow channel={channel.id} />
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction>
            <IconDots />
          </SidebarMenuAction>
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
              onClick={() => router.push("/status?channel=" + channel.id)}
            >
              <IconHeartRateMonitor />
              Status
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
    </SidebarMenuItem>
  );
}
