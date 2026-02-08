import { eq, and, desc } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { KnowledgeRepository } from "@/server/domain/knowledge/repositories/knowledge-repository";
import type { Logger } from "@/server/domain/knowledge/ports/logger";
import { KnowledgeItem } from "@/server/domain/knowledge/entities/knowledge-item";
import * as schema from "@/db/schema";

export class DrizzleKnowledgeRepository implements KnowledgeRepository {
  private readonly logger: Logger;

  constructor(db: DrizzleD1Database<typeof schema>, logger: Logger) {
    this.db = db;
    this.logger = logger.child({ layer: "infrastructure", component: "DrizzleKnowledgeRepository" });
  }

  private readonly db: DrizzleD1Database<typeof schema>;

  async save(item: KnowledgeItem) {
    this.logger.debug("DB INSERT操作を開始", {
      operation: "insert",
      itemId: item.id,
      userId: item.userId,
    });

    const startTime = Date.now();

    try {
      await this.db.insert(schema.knowledgeItem).values({
        id: item.id,
        userId: item.userId,
        url: item.url,
        title: item.title,
        summary: item.summary,
        tags: [...item.tags],
        createdAt: item.createdAt,
      });

      const duration = Date.now() - startTime;
      this.logger.debug("DB INSERT操作完了", {
        operation: "insert",
        itemId: item.id,
        userId: item.userId,
        durationMs: duration,
      });
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("DB INSERT操作失敗", {
        operation: "insert",
        itemId: item.id,
        userId: item.userId,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }

  async findById(id: string, userId: string) {
    this.logger.debug("DB SELECT BY ID操作を開始", {
      operation: "select",
      itemId: id,
      userId,
    });

    const startTime = Date.now();

    try {
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

      const duration = Date.now() - startTime;
      this.logger.debug("DB SELECT BY ID操作完了", {
        operation: "select",
        itemId: id,
        userId,
        found: !!row,
        durationMs: duration,
      });

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
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("DB SELECT BY ID操作失敗", {
        operation: "select",
        itemId: id,
        userId,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }

  async findAllByUserId(userId: string) {
    this.logger.debug("DB SELECT ALL BY USER操作を開始", {
      operation: "select_all",
      userId,
    });

    const startTime = Date.now();

    try {
      const rows = await this.db
        .select()
        .from(schema.knowledgeItem)
        .where(eq(schema.knowledgeItem.userId, userId))
        .orderBy(desc(schema.knowledgeItem.createdAt))
        .all();

      const duration = Date.now() - startTime;
      this.logger.debug("DB SELECT ALL BY USER操作完了", {
        operation: "select_all",
        userId,
        rowCount: rows.length,
        durationMs: duration,
      });

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
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("DB SELECT ALL BY USER操作失敗", {
        operation: "select_all",
        userId,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }

  async deleteById(id: string, userId: string) {
    this.logger.debug("DB DELETE操作を開始", {
      operation: "delete",
      itemId: id,
      userId,
    });

    const startTime = Date.now();

    try {
      await this.db
        .delete(schema.knowledgeItem)
        .where(
          and(
            eq(schema.knowledgeItem.id, id),
            eq(schema.knowledgeItem.userId, userId),
          ),
        );

      const duration = Date.now() - startTime;
      this.logger.debug("DB DELETE操作完了", {
        operation: "delete",
        itemId: id,
        userId,
        durationMs: duration,
      });
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("DB DELETE操作失敗", {
        operation: "delete",
        itemId: id,
        userId,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }
}
