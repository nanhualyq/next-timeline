"use client";
import { patchArticle } from "@/app/actions";
import { useCountStore } from "../../_components/CountStore";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import { Spinner } from "@/components/ui/spinner";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type StarState = {
  isStar: boolean;
  loading: boolean;
  error: string;
};

type StarStore = {
  starMap: Record<number, StarState>;
  initStar: (id: number, star: boolean) => void;
  toggleStar: (id: number) => Promise<void>;
};

export const useStarStore = create<StarStore>()(
  immer((set, get) => ({
    starMap: {},
    initStar(id: number, star: boolean) {
      set((state) => {
        state.starMap[id] = {
          isStar: star,
          loading: false,
          error: "",
        };
      });
    },
    toggleStar: async (id: number) => {
      try {
        set((state) => {
          state.starMap[id]["loading"] = true;
        });
        const star = !get().starMap[id].isStar;
        await patchArticle({ id, star });
        set((state) => {
          state.starMap[id]["isStar"] = star;
        });
        useCountStore.getState().plusStar(star ? 1 : -1);
      } catch (error) {
        set((state) => {
          state.starMap[id]["error"] = error + "";
        });
      } finally {
        set((state) => {
          state.starMap[id]["loading"] = false;
        });
      }
    },
  }))
);

interface Props {
  article: {
    id: number;
    star: boolean | null;
  };
}

export default function StarToggle({ article }: Props) {
  const { id } = article;
  const { starMap, toggleStar } = useStarStore();
  const { isStar, loading, error } = starMap[id] || {};

  const C = isStar ? IconStarFilled : IconStar;
  const style = { fontSize: "1.4rem", color: "gray" };
  if (isStar) {
    style.color = "orange";
  }
  const starComponent = <C style={style} onClick={() => toggleStar(id)} />;

  if (loading) {
    return <Spinner className="size-6" />;
  }
  if (error) {
    return (
      <div>
        <span className="absolute -translate-y-full bg-red-700 p-1 rounded-md text-white">
          {error}
        </span>
        {starComponent}
      </div>
    );
  }
  return starComponent;
}
