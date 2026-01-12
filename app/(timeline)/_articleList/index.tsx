"use client";
import {
  useEventListener,
  useInfiniteScroll,
  useKeyPress,
  useResponsive,
} from "ahooks";
import { ArticleListReturn, getArticleList, readArticles } from "../../actions";
import { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import StarToggle, { useStarStore } from "../article/[id]/StarToggle";
import Pubtime from "../article/[id]/Pubtime";
import { produce } from "immer";
import { invoke } from "lodash-es";
import ChannelTitle from "../_components/ChannelTitle";
import { useCountStore } from "../_components/CountStore";
import useSwipe from "./useSwipe";
import { Spinner } from "@/components/ui/spinner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconEye, IconInfoOctagon } from "@tabler/icons-react";

interface Props {
  initData: ArticleListReturn;
}

const limit = 20;

export default function ArticleList(props: Props) {
  const router = useRouter();
  const ulRef = useRef<HTMLUListElement>(null);
  const params = useSearchParams();
  const { plusUnread } = useCountStore();
  const { initStar, toggleStar, starMap } = useStarStore();
  const { sm } = useResponsive();

  const { data, loadingMore, mutate, loading } =
    useInfiniteScroll<ArticleListReturn>(
      async (d) => {
        if (!d) {
          return props.initData;
        }
        return getArticleList({
          limit,
          lastId: d.list[d.list.length - 1].article.id,
          lastPubtime: d.list[d.list.length - 1].article.pub_time,
          ...Object.fromEntries(params),
        });
      },
      {
        target: ulRef,
        isNoMore: (data) => !data?.hasMore,
        onSuccess: (data) =>
          data.list.forEach((item) =>
            initStar(item.article.id, !!item.article.star)
          ),
      }
    );

  const pathname = usePathname();
  const segment = pathname.startsWith("/article");

  function viewArticle(index: number) {
    if (!data || !data.list || !data.list[index]) {
      return;
    }
    const { article } = data?.list[index];
    const target = `/article/${article.id}`;
    if (segment) {
      router.replace(target);
    } else {
      router.push(target);
    }
    if (!article.read) {
      plusUnread(article.channel_id, -1);
      mutate(
        produce(data, (draft) => {
          draft.list[index].article.read = true;
        })
      );
    }
  }

  const [active, setActive] = useState(-1);

  function moveActive(offset: number) {
    const newIndex = active + offset;
    if (newIndex < 0) {
      return;
    } else if (data?.list && newIndex >= data?.list?.length) {
      return;
    }
    setActive(newIndex);
    if (segment) {
      viewArticle(newIndex);
    }
  }

  const keyCallbackMap = {
    uparrow: () => moveActive(-1),
    k: () => moveActive(-1),
    j: () => moveActive(1),
    downarrow: () => moveActive(1),
    enter() {
      if (!segment) {
        viewArticle(active);
      }
    },
    home() {
      if (!segment) {
        setActive(0);
      }
    },
    end() {
      if (!segment && data) {
        setActive(data?.list?.length - 1);
      }
    },
    f() {
      if (data) {
        toggleStar(data?.list[active]?.article.id);
      }
    },
    m: () => readAbove(active),
    o: () => {
      const url = data?.list[active]?.article.link;
      if (url) {
        window.open(url);
      }
    },
  };

  useKeyPress(
    ["j", "k", "uparrow", "downarrow", "enter", "home", "end", "f", "m", "o"],
    (e, key) => invoke(keyCallbackMap, key)
  );

  useSwipe({
    onSwipeLeft: () => segment && moveActive(1),
    onSwipeRight: () => segment && moveActive(-1),
  });

  useEffect(() => {
    ulRef?.current?.querySelector(`li[data-active]`)?.scrollIntoView({
      block: "center",
    });
  }, [active]);

  function readAbove(index: number) {
    const ids: number[] = [];
    mutate(
      produce(data, (draft) => {
        if (!draft) {
          return;
        }
        for (let i = index; i >= 0; i--) {
          if (!draft.list[i].article.read) {
            ids.push(draft.list[i].article.id);
            draft.list[i].article.read = true;
            plusUnread(draft.list[i].article.channel_id, -1);
          }
        }
      })
    );
    readArticles(ids);
  }

  const [menuIndex, setMenuIndex] = useState(-1);
  useEventListener(
    "click",
    (e) => {
      if (menuIndex !== -1) {
        if (
          e.target instanceof Element &&
          !e.target?.closest(`dialog.${styles.others}`)
        ) {
          e.stopPropagation();
          setMenuIndex(-1);
        }
      }
    },
    {
      capture: true,
    }
  );

  if (!loading && (!data || !data.list.length)) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconInfoOctagon />
          </EmptyMedia>
          <EmptyTitle>No Articles Yet</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className={styles.ul} ref={ulRef}>
      {data?.list.map((item, index) => {
        const { article, channel } = item;
        const ToolsBox = menuIndex === index ? "dialog" : "div";
        return (
          <li
            key={article.id}
            className={styles.li}
            data-active={active === index || undefined}
            data-read={article.read || undefined}
            data-star={starMap[article.id].isStar || undefined}
            onClick={() => {
              setActive(index);
              viewArticle(index);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (!sm) {
                setMenuIndex(index);
              }
            }}
          >
            {article.cover && (
              <div className={styles.cover}>
                <img src={article.cover} />
              </div>
            )}
            <div className={styles.title}>
              <a
                href={article.link}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                {article.title}
              </a>
            </div>
            <div className={styles.summary}>{article.summary}</div>
            {(sm || menuIndex === index) && (
              <ToolsBox
                className={styles.others}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuIndex(-1);
                }}
              >
                <StarToggle article={article} />
                <a
                  onClick={() => readAbove(index)}
                  className="flex gap-1 items-center"
                >
                  <IconEye />
                  <span className="text">Read above</span>
                </a>
                <Pubtime time={article.pub_time} />
                <ChannelTitle channel={channel!} />
                {article.author && <span>by {article.author}</span>}
              </ToolsBox>
            )}
          </li>
        );
      })}
      {loadingMore && (
        <p className="flex flex-col justify-center items-center">
          <Spinner /> Loading...
        </p>
      )}
    </ul>
  );
}
