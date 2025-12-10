"use client";
import { patchArticle } from "@/app/actions";
import { ArticleSelect } from "@/src/db/article";
import { LoadingOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { useBoolean, useRequest } from "ahooks";
import { Modal } from "antd";
import { useEffect } from "react";

interface Props {
  article: ArticleSelect;
  inModal?: boolean;
}

export const STAR_EVENT_NAME = "article-toggle-star-in-modal";

export default function StarToggle({ article, inModal }: Props) {
  const { id, star } = article;
  const [isStar, { toggle, set }] = useBoolean();
  useEffect(() => {
    set(!!star);
  }, [star]);
  const { loading, run } = useRequest(patchArticle, {
    manual: true,
    onSuccess: () => {
      toggle();
      if (inModal) {
        window.dispatchEvent(
          new CustomEvent(STAR_EVENT_NAME, {
            detail: { id, star: !isStar },
          })
        );
      }
    },
    onError(error) {
      const modal = Modal.error({
        content: error + "",
        onOk() {
          modal.destroy();
        },
      });
    },
  });
  const C = isStar ? StarFilled : StarOutlined;
  const style = { fontSize: "1.4rem", color: "gray" };
  if (isStar) {
    style.color = "orange";
  }

  if (loading) {
    return <LoadingOutlined style={style} />;
  }
  return <C style={style} onClick={() => run({ id: id, star: !isStar })} />;
}
