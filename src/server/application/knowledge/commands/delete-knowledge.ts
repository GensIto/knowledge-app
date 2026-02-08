import type { ContentStorage } from "@/server/domain/knowledge/ports/content-storage";
import type { Logger } from "@/server/domain/knowledge/ports/logger";
import type { KnowledgeRepository } from "@/server/domain/knowledge/repositories/knowledge-repository";

export class DeleteKnowledgeUseCase {
  private readonly logger: Logger;

  constructor(
    knowledgeRepository: KnowledgeRepository,
    contentStorage: ContentStorage,
    logger: Logger,
  ) {
    this.knowledgeRepository = knowledgeRepository;
    this.contentStorage = contentStorage;
    this.logger = logger.child({ layer: "application", useCase: "DeleteKnowledgeUseCase" });
  }

  private readonly knowledgeRepository: KnowledgeRepository;
  private readonly contentStorage: ContentStorage;

  async execute(id: string, userId: string): Promise<void> {
    this.logger.info("知識削除処理を開始", { id, userId });
    const startTime = Date.now();

    try {
      // 削除前にアイテムを取得
      const item = await this.knowledgeRepository.findById(id, userId);
      if (!item || item.userId !== userId) {
        throw new Error("Knowledge item not found or unauthorized");
      }

      await this.knowledgeRepository.deleteById(id, userId);
      this.logger.debug("リポジトリから削除完了", { id, userId });

      await this.contentStorage.deleteMarkdown(`${userId}/${item.id}.md`);
      this.logger.debug("ストレージから削除完了", { id });

      const duration = Date.now() - startTime;
      this.logger.info("知識削除処理完了", {
        id,
        userId,
        durationMs: duration,
      });
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("知識削除処理失敗", {
        id,
        userId,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }
  }
}
