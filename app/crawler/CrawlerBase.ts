abstract class CrawlerBase {
  constructor(protected url: string) {}
  abstract crawler(): Promise<unknown>;
  get feed(): unknown {
    return null;
  }
  get items(): unknown {
    return null;
  }
}

export default CrawlerBase;
