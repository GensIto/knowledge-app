export interface AiSummaryResult {
  summary: string;
  tags: string[];
}

export interface AiSummarizer {
  generateSummaryAndTags(content: string): Promise<AiSummaryResult>;
}
