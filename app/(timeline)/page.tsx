import ArticleList from "./ArticleList";
import { getArticleList } from "../actions";

export default async function Home() {
  const articles = await getArticleList();
  return <ArticleList initData={articles} />;
}
