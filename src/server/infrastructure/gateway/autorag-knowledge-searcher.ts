import type {
  KnowledgeSearcher,
  KnowledgeSearchResult,
} from "@/server/domain/knowledge/ports/knowledge-searcher";
import type { Logger } from "@/server/domain/knowledge/ports/logger";

const MAX_RESULTS = 10;

export class AutoRagKnowledgeSearcher implements KnowledgeSearcher {
  private readonly logger: Logger;

  constructor(ai: Ai, logger: Logger) {
    this.ai = ai;
    this.logger = logger.child({ layer: "infrastructure", component: "AutoRagKnowledgeSearcher" });
  }

  private readonly ai: Ai;

  async search(query: string): Promise<KnowledgeSearchResult> {
    this.logger.info("RAG検索を開始", {
      query,
      maxResults: MAX_RESULTS,
    });

    const startTime = Date.now();
    let result;

    try {
      result = await this.ai.autorag("knowledge-rag").aiSearch({
        query,
        max_num_results: MAX_RESULTS,
      });

      const duration = Date.now() - startTime;
      this.logger.info("RAG検索完了", {
        query,
        durationMs: duration,
        hitCount: result.data.length,
        sources: result.data.map((item) => ({
          filename: item.filename,
          score: item.score,
        })),
      });
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("RAG検索失敗", {
        query,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }

    const searchResult = {
      response: result.response,
      sources: result.data.map((item) => ({
        filename: item.filename,
        score: item.score,
        content: item.content.map((c) => c.text ?? "").join("\n"),
      })),
    };

    this.logger.debug("RAG検索結果", {
      responseLength: searchResult.response.length,
      sourcesCount: searchResult.sources.length,
    });

    return searchResult;
  }
}
