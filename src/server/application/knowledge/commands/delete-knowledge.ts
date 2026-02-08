import type { KnowledgeRepository } from "@/server/domain/knowledge/repositories/knowledge-repository";

export class DeleteKnowledgeUseCase {
  constructor(private readonly knowledgeRepository: KnowledgeRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    await this.knowledgeRepository.deleteById(id, userId);
  }
}
