import type { KnowledgeItem } from "../entities/knowledge-item";

export interface KnowledgeRepository {
  save(item: KnowledgeItem): Promise<void>;
  findById(id: string, userId: string): Promise<KnowledgeItem | null>;
  findAllByUserId(userId: string): Promise<KnowledgeItem[]>;
  deleteById(id: string, userId: string): Promise<void>;
}
