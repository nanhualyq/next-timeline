abstract class CrawlerBase {
  constructor(protected url: string) {}
  abstract crawler(): Promise<unknown>;
  get feed(): unknown {
    return null;
  }
  get items(): unknown {
    return null;
  }
  abstract saveChannel(): Promise<unknown>;
  abstract saveArticles(channel_id: number): Promise<unknown>;
}

export default CrawlerBase;
