export interface KnowledgeSearchSource {
  filename: string;
  score: number;
  content: string;
}

export interface KnowledgeSearchResult {
  response: string;
  sources: KnowledgeSearchSource[];
}

export interface KnowledgeSearcher {
  search(query: string): Promise<KnowledgeSearchResult>;
}
