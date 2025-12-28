"use client";
import { countStar, countUnread } from "@/app/actions";
import { useSidebar } from "@/components/ui/sidebar";
import { useInterval } from "ahooks";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type State = {
  unread: Record<string, number>;
  star: number;
};

type Actions = {
  fetchUnread: () => void;
  fetchStar: () => void;
  plusUnread: (id: number, offset: number) => void;
  plusStar: (offset: number) => void;
};

export const useCountStore = create<State & Actions>()(
  immer((set) => ({
    unread: {},
    star: 0,
    fetchUnread: async () => {
      const res = await countUnread();
      set((state) => {
        state.unread = res;
      });
    },
    fetchStar: async () => {
      const res = await countStar();
      set((state) => {
        state.star = res.count;
      });
    },
    plusUnread: (id, offset) => {
      set((state) => {
        state.unread[id] = (state.unread[id] || 0) + offset;
      });
    },
    plusStar: (offset) => {
      set((state) => {
        state.star += offset;
      });
    },
  }))
);

export default function CountStore() {
  const { fetchUnread, fetchStar, unread } = useCountStore();
  const unreadCount = Object.values(unread).reduce((a, b) => a + b, 0);
  function refreshCount() {
    fetchUnread();
    fetchStar();
  }
  useEffect(() => {
    if (unreadCount) {
      document.title = `(${unreadCount}) ${document.title.replace(
        /^\(\d+\)\s?/,
        ""
      )}`;
    }
  }, [unreadCount]);
  useInterval(refreshCount, 1000 * 60 * 5, {
    immediate: true,
  });
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    refreshCount();
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [pathname, searchParams]);
  return null;
}
