import type { ContentStorage } from "@/server/domain/knowledge/ports/content-storage";

export class CloudflareContentStorage implements ContentStorage {
  constructor(private readonly bucket: R2Bucket) {}

  async saveMarkdown(key: string, content: string): Promise<void> {
    await this.bucket.put(key, content, {
      httpMetadata: {
        contentType: "text/markdown",
      },
    });
  }
}
