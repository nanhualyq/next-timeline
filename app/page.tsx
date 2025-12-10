import { Button } from "antd";
import Link from "next/link";
import ArticleList from "./ArticleList";
import { getArticleList } from "./actions";

export default async function Home() {
  const articles = await getArticleList();
  return (
    <>
      <Link href="/channel/add">
        <Button>add feed</Button>
      </Link>
      <ArticleList initData={articles} />
    </>
  );
}
