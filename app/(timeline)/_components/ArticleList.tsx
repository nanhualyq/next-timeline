"use client";
import { useEventListener, useInfiniteScroll, useKeyPress } from "ahooks";
import { ArticleListReturn, getArticleList } from "../../actions";
import { useEffect, useRef, useState } from "react";
import styles from "./articleList.module.css";
import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from "next/navigation";
import StarToggle, { STAR_EVENT_NAME } from "../article/[id]/StarToggle";
import Pubtime from "../article/[id]/Pubtime";
import Link from "next/link";
import { produce } from "immer";
import { invoke } from "lodash-es";
import { Divider, Result } from "antd";

interface Props {
  initData: ArticleListReturn;
}

const limit = 20;

export default function ArticleList(props: Props) {
  const router = useRouter();
  const ulRef = useRef<HTMLUListElement>(null);
  const params = useSearchParams();
  const { data, loadingMore, mutate, loading } =
    useInfiniteScroll<ArticleListReturn>(
      async (d) => {
        if (!d) {
          return props.initData;
        }
        return getArticleList({
          limit,
          offset: d.list.length,
          ...params,
        });
      },
      {
        target: ulRef,
        isNoMore: (data) => !data?.hasMore,
      }
    );

  const segment = useSelectedLayoutSegment("modal");

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
    mutate(
      produce(data, (draft) => {
        draft.list[index].article.read = true;
      })
    );
  }

  useEventListener(STAR_EVENT_NAME, handleStarToggle);

  function handleStarToggle(event: Event): void {
    if ("detail" in event) {
      const { id, star } = event.detail as { id: number; star: boolean };
      if (data?.list) {
        const targetIndex = data.list.findIndex(
          (item) => item.article.id === id
        );
        if (targetIndex === -1) {
          return;
        }
        mutate(
          produce(data, (draft) => {
            draft.list[targetIndex].article.star = star;
          })
        );
      }
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
      const starEl = ulRef?.current?.querySelector(
        `.${styles["li_active"]} .anticon-star`
      ) as HTMLSpanElement;
      starEl?.click();
    },
  };

  useKeyPress(
    ["j", "k", "uparrow", "downarrow", "enter", "home", "end", "f"],
    (e, key) => invoke(keyCallbackMap, key)
  );

  useEffect(() => {
    ulRef?.current?.querySelector(`.${styles["li_active"]}`)?.scrollIntoView();
  }, [active]);

  if (!loading && (!data || !data.list.length)) {
    return <Result status="info" title="No More Articles!" />;
  }

  return (
    <ul className={styles.ul} ref={ulRef}>
      {data?.list.map((item, index) => {
        const { article, channel } = item;
        return (
          <li
            key={article.id}
            className={`${styles.li} ${article.read ? styles["li-read"] : ""} ${
              active === index ? styles["li_active"] : ""
            }`}
            onClick={() => {
              setActive(index);
              viewArticle(index);
            }}
          >
            {article.cover && (
              <div className={styles.cover}>
                <img src={article.cover} alt={article.title} />
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
            <div className={styles.others}>
              <span onClick={(e) => e.stopPropagation()}>
                <StarToggle article={article} />
              </span>
              <Pubtime time={article.pub_time} />
              <Link
                href={`/?channel=${channel?.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                {channel?.title}
              </Link>
            </div>
          </li>
        );
      })}
      {loadingMore && <Divider>Loading More...</Divider>}
    </ul>
  );
}
