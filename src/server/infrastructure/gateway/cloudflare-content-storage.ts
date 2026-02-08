import type { ContentStorage } from "@/server/domain/knowledge/ports/content-storage";
import type { Logger } from "@/server/domain/knowledge/ports/logger";

export class CloudflareContentStorage implements ContentStorage {
  private readonly logger: Logger;

  constructor(bucket: R2Bucket, logger: Logger) {
    this.bucket = bucket;
    this.logger = logger.child({ layer: "infrastructure", component: "CloudflareContentStorage" });
  }

  private readonly bucket: R2Bucket;

  async saveMarkdown(key: string, content: string): Promise<void> {
    this.logger.debug("R2保存を開始", {
      operation: "put",
      key,
      contentLength: content.length,
    });

    const startTime = Date.now();

    try {
      await this.bucket.put(key, content, {
        httpMetadata: {
          contentType: "text/markdown",
        },
      });

      const duration = Date.now() - startTime;
      this.logger.debug("R2保存完了", {
        operation: "put",
        key,
        contentLength: content.length,
        durationMs: duration,
      });
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("R2保存失敗", {
        operation: "put",
        key,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }

  async deleteMarkdown(key: string): Promise<void> {
    this.logger.debug("R2削除を開始", {
      operation: "delete",
      key,
    });

    const startTime = Date.now();

    try {
      await this.bucket.delete(key);

      const duration = Date.now() - startTime;
      this.logger.debug("R2削除完了", {
        operation: "delete",
        key,
        durationMs: duration,
      });
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("R2削除失敗", {
        operation: "delete",
        key,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  }
}
