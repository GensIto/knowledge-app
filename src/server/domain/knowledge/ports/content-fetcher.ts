export interface ContentFetcher {
  fetchMarkdown(url: string): Promise<string>;
}
