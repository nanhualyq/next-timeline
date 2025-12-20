import ArticleList from "./_articleList";
import { getArticleList } from "../actions";
import FilterBar from "./_articleList/FilterBar";
import { Suspense } from "react";

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
      <Suspense fallback="loading...">
        <FilterBar />
      </Suspense>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Suspense fallback="loading...">
          <ArticleList key={JSON.stringify(params)} initData={articles} />
        </Suspense>
      </div>
    </div>
  );
}
