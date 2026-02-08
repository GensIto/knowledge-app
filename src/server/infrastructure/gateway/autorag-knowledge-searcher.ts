import type {
  KnowledgeSearcher,
  KnowledgeSearchResult,
} from "@/server/domain/knowledge/ports/knowledge-searcher";

export class AutoRagKnowledgeSearcher implements KnowledgeSearcher {
  constructor(private readonly ai: Ai) {}

  async search(query: string): Promise<KnowledgeSearchResult> {
    const result = await this.ai.autorag("knowledge-rag").aiSearch({
      query,
      max_num_results: 10,
    });

    return {
      response: result.response,
      sources: result.data.map((item) => ({
        filename: item.filename,
        score: item.score,
        content: item.content.map((c) => c.text ?? "").join("\n"),
      })),
    };
  }
}
