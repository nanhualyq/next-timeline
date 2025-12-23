import { getArticle, patchArticle } from "@/app/actions";
import { use } from "react";
import styles from "./page.module.css";
import StarToggle from "./StarToggle";
import Pubtime from "./Pubtime";
import ChannelTitle from "../../_components/ChannelTitle";

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
        <h1>
          <a href={article.link} target="_blank">
            {article.title}
          </a>
        </h1>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: article.content + "" }}
        ></div>
      </div>
      <hr className="mb-2 mt-2" />
      <div className={styles.footer}>
        <StarToggle article={article} inModal={inModal} />
        <Pubtime time={article.pub_time || ""} />
        <ChannelTitle channel={channel!} />
        {article.author && <span>by {article.author}</span>}
      </div>
    </article>
  );
}
