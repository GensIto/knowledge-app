import type { KnowledgeSearcher } from "@/server/domain/knowledge/ports/knowledge-searcher";
import type { Logger } from "@/server/domain/knowledge/ports/logger";

export class SearchKnowledgeUseCase {
  private readonly logger: Logger;

  constructor(knowledgeSearcher: KnowledgeSearcher, logger: Logger) {
    this.knowledgeSearcher = knowledgeSearcher;
    this.logger = logger.child({ layer: "application", useCase: "SearchKnowledgeUseCase" });
  }

  private readonly knowledgeSearcher: KnowledgeSearcher;

  async execute(query: string) {
    this.logger.info("知識検索処理を開始", { query });
    const startTime = Date.now();

    try {
      const result = await this.knowledgeSearcher.search(query);

      const duration = Date.now() - startTime;
      this.logger.info("知識検索処理完了", {
        query,
        sourcesCount: result.sources.length,
        durationMs: duration,
      });

      return result;
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("知識検索処理失敗", {
        query,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }
  }
}
