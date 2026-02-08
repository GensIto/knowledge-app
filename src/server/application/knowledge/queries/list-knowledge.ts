import type { KnowledgeRepository } from "@/server/domain/knowledge/repositories/knowledge-repository";
import type { Logger } from "@/server/domain/knowledge/ports/logger";

export class ListKnowledgeUseCase {
  private readonly logger: Logger;

  constructor(knowledgeRepository: KnowledgeRepository, logger: Logger) {
    this.knowledgeRepository = knowledgeRepository;
    this.logger = logger.child({ layer: "application", useCase: "ListKnowledgeUseCase" });
  }

  private readonly knowledgeRepository: KnowledgeRepository;

  async execute(userId: string) {
    this.logger.info("知識一覧取得処理を開始", { userId });
    const startTime = Date.now();

    try {
      const items = await this.knowledgeRepository.findAllByUserId(userId);

      const duration = Date.now() - startTime;
      this.logger.info("知識一覧取得処理完了", {
        userId,
        itemsCount: items.length,
        durationMs: duration,
      });

      return items.map((item) => ({
        id: item.id,
        url: item.url,
        title: item.title,
        summary: item.summary,
        tags: [...item.tags],
        createdAt: item.createdAt.toISOString(),
      }));
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("知識一覧取得処理失敗", {
        userId,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }
  }
}
