import ArticleList from "./_components/ArticleList";
import { getArticleList } from "../actions";
import FilterBar from "./_components/FilterBar";

interface Props {
  searchParams: Promise<Record<string, string>>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;

  const articles = await getArticleList({
    limit: 20,
    ...params,
  });
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <FilterBar />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <ArticleList key={JSON.stringify(params)} initData={articles} />;
      </div>
    </div>
  );
}
