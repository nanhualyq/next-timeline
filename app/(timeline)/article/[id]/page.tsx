import { getArticle, patchArticle } from "@/app/actions";
import { use } from "react";
import styles from "./page.module.css";
import StarToggle from "./StarToggle";
import Pubtime from "./Pubtime";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
  height: string;
  inModal: boolean;
}

export default function Article({ params, height, inModal }: Props) {
  const { id } = use(params);
  const { article, channel } = use(getArticle(+id));
  if (!article.read) {
    patchArticle({
      id: article.id,
      read: true,
    });
  }

  return (
    <article className={styles.root} style={{ height }}>
      <div className={styles.scroll}>
        <h1>{article.title}</h1>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: article.content + "" }}
        ></div>
      </div>
      <div className={styles.footer}>
        <StarToggle article={article} inModal={inModal} />
        <Pubtime time={article.pub_time || ""} />
        <Link href={`/?channel=${channel?.id}`}>{channel?.title}</Link>
      </div>
    </article>
  );
}
