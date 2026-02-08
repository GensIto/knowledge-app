import type { KnowledgeRepository } from "@/server/domain/knowledge/repositories/knowledge-repository";

export class ListKnowledgeUseCase {
  constructor(private readonly knowledgeRepository: KnowledgeRepository) {}

  async execute(userId: string) {
    const items = await this.knowledgeRepository.findAllByUserId(userId);
    return items.map((item) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      summary: item.summary,
      tags: [...item.tags],
      createdAt: item.createdAt.toISOString(),
    }));
  }
}
