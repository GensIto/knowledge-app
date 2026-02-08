import type { ContentFetcher } from "@/server/domain/knowledge/ports/content-fetcher";
import type { AiSummarizer } from "@/server/domain/knowledge/ports/ai-summarizer";
import type { ContentStorage } from "@/server/domain/knowledge/ports/content-storage";
import type { Logger } from "@/server/domain/knowledge/ports/logger";
import type { KnowledgeRepository } from "@/server/domain/knowledge/repositories/knowledge-repository";
import { KnowledgeItem } from "@/server/domain/knowledge/entities/knowledge-item";
import { extractTitle } from "@/server/domain/knowledge/services/content-extractor";

export class ExtractAndSaveUseCase {
  private readonly logger: Logger;

  constructor(
    contentFetcher: ContentFetcher,
    aiSummarizer: AiSummarizer,
    knowledgeRepository: KnowledgeRepository,
    contentStorage: ContentStorage,
    logger: Logger,
  ) {
    this.contentFetcher = contentFetcher;
    this.aiSummarizer = aiSummarizer;
    this.knowledgeRepository = knowledgeRepository;
    this.contentStorage = contentStorage;
    this.logger = logger.child({ layer: "application", useCase: "ExtractAndSaveUseCase" });
  }

  private readonly contentFetcher: ContentFetcher;
  private readonly aiSummarizer: AiSummarizer;
  private readonly knowledgeRepository: KnowledgeRepository;
  private readonly contentStorage: ContentStorage;

  async execute(input: { url: string; userId: string }) {
    const { url, userId } = input;

    this.logger.info("知識抽出・保存処理を開始", { url, userId });
    const startTime = Date.now();

    try {
      // 1. URL重複チェック(高コスト処理前に実施)
      this.logger.debug("URL重複チェックステップ");
      const existing = await this.knowledgeRepository.findByUrl(url, userId);
      if (existing) {
        this.logger.warn("URLが既に登録されています", { url, userId, existingId: existing.id });
        throw new Error(`このURLは既に登録されています: ${url}`);
      }

      // 2. Markdown取得
      this.logger.debug("Markdown取得ステップ");
      const markdown = await this.contentFetcher.fetchMarkdown(url);

      // 3. タイトル抽出
      this.logger.debug("タイトル抽出ステップ");
      const title = extractTitle(markdown, url);
      this.logger.debug("タイトル抽出完了", { title });

      // 4. AI要約・タグ生成
      this.logger.debug("AI要約・タグ生成ステップ");
      const { summary, tags } =
        await this.aiSummarizer.generateSummaryAndTags(markdown);

      // 5. ドメインエンティティ作成
      const item = KnowledgeItem.create({
        userId,
        url,
        title,
        summary,
        tags,
      });

      this.logger.debug("KnowledgeItem作成完了", { itemId: item.id });

      // 6. リポジトリ保存
      this.logger.debug("リポジトリ保存ステップ");
      await this.knowledgeRepository.save(item);

      // 7. コンテンツストレージ保存
      this.logger.debug("コンテンツストレージ保存ステップ");
      await this.contentStorage.saveMarkdown(
        `${userId}/${item.id}.md`,
        markdown,
      );

      const duration = Date.now() - startTime;
      this.logger.info("知識抽出・保存処理完了", {
        url,
        userId,
        itemId: item.id,
        title: item.title,
        durationMs: duration,
      });

      return {
        id: item.id,
        url: item.url,
        title: item.title,
        summary: item.summary,
        tags: [...item.tags],
        createdAt: item.createdAt.toISOString(),
      };
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("知識抽出・保存処理失敗", {
        url,
        userId,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }
  }
}
