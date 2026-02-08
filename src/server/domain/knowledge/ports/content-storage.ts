export interface ContentStorage {
  saveMarkdown(key: string, content: string): Promise<void>;
}
