"use client";
import { countStar, countUnread } from "@/app/actions";
import { useInterval } from "ahooks";
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
  const { fetchUnread, fetchStar } = useCountStore();
  useInterval(
    () => {
      fetchUnread();
      fetchStar();
      console.log("fetch count data");
    },
    1000 * 60 * 5,
    {
      immediate: true,
    }
  );
  return null;
}
