"use client";
import { patchArticle } from "@/app/actions";
import { LoadingOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { useBoolean, useRequest } from "ahooks";
import { useEffect } from "react";
import { useCountStore } from "../../_components/CountStore";
import Swal from "sweetalert2";

interface Props {
  article: {
    id: number;
    star: boolean | null;
  };
  inModal?: boolean;
}

export const STAR_EVENT_NAME = "article-toggle-star-in-modal";

export default function StarToggle({ article, inModal }: Props) {
  const { id, star } = article;
  const [isStar, { toggle, set }] = useBoolean();
  const { plusStar } = useCountStore();

  useEffect(() => {
    set(!!star);
  }, [star]);

  const { loading, run } = useRequest(patchArticle, {
    manual: true,
    onSuccess: () => {
      toggle();
      plusStar(isStar ? -1 : 1);

      if (inModal) {
        window.dispatchEvent(
          new CustomEvent(STAR_EVENT_NAME, {
            detail: { id, star: !isStar },
          })
        );
      }
    },
    onError(error) {
      Swal.fire(error + "");
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
