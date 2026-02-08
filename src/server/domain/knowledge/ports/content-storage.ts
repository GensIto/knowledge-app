export interface ContentStorage {
  saveMarkdown(key: string, content: string): Promise<void>;
  deleteMarkdown(key: string): Promise<void>;
}
