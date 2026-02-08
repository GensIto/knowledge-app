import { eq, and, desc } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { KnowledgeRepository } from "@/server/domain/knowledge/repositories/knowledge-repository";
import { KnowledgeItem } from "@/server/domain/knowledge/entities/knowledge-item";
import * as schema from "@/db/schema";

export class DrizzleKnowledgeRepository implements KnowledgeRepository {
  constructor(private readonly db: DrizzleD1Database<typeof schema>) {}

  async save(item: KnowledgeItem) {
    await this.db.insert(schema.knowledgeItem).values({
      id: item.id,
      userId: item.userId,
      url: item.url,
      title: item.title,
      summary: item.summary,
      tags: [...item.tags],
      createdAt: item.createdAt,
    });
  }

  async findById(id: string, userId: string) {
    const row = await this.db
      .select()
      .from(schema.knowledgeItem)
      .where(
        and(
          eq(schema.knowledgeItem.id, id),
          eq(schema.knowledgeItem.userId, userId),
        ),
      )
      .get();

    if (!row) return null;

    return KnowledgeItem.reconstitute({
      id: row.id,
      userId: row.userId,
      url: row.url,
      title: row.title,
      summary: row.summary,
      tags: row.tags,
      createdAt: row.createdAt,
    });
  }

  async findAllByUserId(userId: string) {
    const rows = await this.db
      .select()
      .from(schema.knowledgeItem)
      .where(eq(schema.knowledgeItem.userId, userId))
      .orderBy(desc(schema.knowledgeItem.createdAt))
      .all();

    return rows.map((row) =>
      KnowledgeItem.reconstitute({
        id: row.id,
        userId: row.userId,
        url: row.url,
        title: row.title,
        summary: row.summary,
        tags: row.tags,
        createdAt: row.createdAt,
      }),
    );
  }

  async deleteById(id: string, userId: string) {
    await this.db
      .delete(schema.knowledgeItem)
      .where(
        and(
          eq(schema.knowledgeItem.id, id),
          eq(schema.knowledgeItem.userId, userId),
        ),
      );
  }
}
