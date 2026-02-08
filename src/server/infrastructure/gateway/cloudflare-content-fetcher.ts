import Cloudflare from "cloudflare";
import type { ContentFetcher } from "@/server/domain/knowledge/ports/content-fetcher";
import type { Logger } from "@/server/domain/knowledge/ports/logger";

export class CloudflareContentFetcher implements ContentFetcher {
  private readonly logger: Logger;
  private readonly client: Cloudflare;
  private readonly accountId: string;

  constructor(accountId: string, apiToken: string, logger: Logger) {
    this.accountId = accountId;
    this.client = new Cloudflare({ apiToken });
    this.logger = logger.child({
      layer: "infrastructure",
      component: "CloudflareContentFetcher",
    });
  }

  async fetchMarkdown(url: string) {
    this.logger.info("Markdown変換を開始", { url });

    const startTime = Date.now();

    try {
      // https://developers.cloudflare.com/browser-rendering/workers-bindings/
      // 複雑なインタラクションではない場合、SKD(REST)がシンプルな選択肢と記載されているのでBindingsを利用していない
      const markdown = await this.client.browserRendering.markdown.create({
        account_id: this.accountId,
        url,
      });

      const duration = Date.now() - startTime;
      this.logger.info("Browser Rendering API呼び出し完了", {
        url,
        durationMs: duration,
      });

      this.logger.info("Markdown変換完了", {
        url,
        markdownLength: markdown.length,
      });

      return markdown;
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("Browser Rendering API呼び出し失敗", {
        url,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw new Error(
        `コンテンツの取得に失敗しました: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}
