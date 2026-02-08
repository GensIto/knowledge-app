import type { KnowledgeSearcher } from "@/server/domain/knowledge/ports/knowledge-searcher";

export class SearchKnowledgeUseCase {
  constructor(private readonly knowledgeSearcher: KnowledgeSearcher) {}

  async execute(query: string) {
    return this.knowledgeSearcher.search(query);
  }
}
