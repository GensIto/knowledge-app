import type { ContentFetcher } from "@/server/domain/knowledge/ports/content-fetcher";
import type { AiSummarizer } from "@/server/domain/knowledge/ports/ai-summarizer";
import type { ContentStorage } from "@/server/domain/knowledge/ports/content-storage";
import type { KnowledgeRepository } from "@/server/domain/knowledge/repositories/knowledge-repository";
import { KnowledgeItem } from "@/server/domain/knowledge/entities/knowledge-item";
import { extractTitle } from "@/server/domain/knowledge/services/content-extractor";

export class ExtractAndSaveUseCase {
  constructor(
    private readonly contentFetcher: ContentFetcher,
    private readonly aiSummarizer: AiSummarizer,
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly contentStorage: ContentStorage,
  ) {}

  async execute(input: { url: string; userId: string }) {
    const { url, userId } = input;

    const markdown = await this.contentFetcher.fetchMarkdown(url);
    const title = extractTitle(markdown, url);
    const { summary, tags } =
      await this.aiSummarizer.generateSummaryAndTags(markdown);

    const item = KnowledgeItem.create({
      userId,
      url,
      title,
      summary,
      tags,
    });

    await this.knowledgeRepository.save(item);
    await this.contentStorage.saveMarkdown(
      `knowledge/${item.id}/content.md`,
      markdown,
    );

    return {
      id: item.id,
      url: item.url,
      title: item.title,
      summary: item.summary,
      tags: [...item.tags],
      createdAt: item.createdAt.toISOString(),
    };
  }
}
