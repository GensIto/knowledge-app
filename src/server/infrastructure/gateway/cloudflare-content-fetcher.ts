import type { ContentFetcher } from "@/server/domain/knowledge/ports/content-fetcher";
import type { Logger } from "@/server/domain/knowledge/ports/logger";

export class CloudflareContentFetcher implements ContentFetcher {
  private readonly logger: Logger;

  constructor(accountId: string, apiToken: string, logger: Logger) {
    this.accountId = accountId;
    this.apiToken = apiToken;
    this.logger = logger.child({ layer: "infrastructure", component: "CloudflareContentFetcher" });
  }

  private readonly accountId: string;
  private readonly apiToken: string;

  async fetchMarkdown(url: string) {
    this.logger.info("Markdown変換を開始", { url });

    const startTime = Date.now();
    const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/browser-rendering/markdown`;

    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const duration = Date.now() - startTime;
      this.logger.info("Browser Rendering API呼び出し完了", {
        url,
        status: response.status,
        durationMs: duration,
      });
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("Browser Rendering API呼び出し失敗", {
        url,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }

    if (!response.ok) {
      this.logger.error("Browser Rendering APIエラーレスポンス", {
        url,
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`コンテンツの取得に失敗しました: ${response.status}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      result: string;
    };

    if (!data.success || !data.result) {
      this.logger.error("Markdown変換失敗", {
        url,
        success: data.success,
        hasResult: !!data.result,
      });
      throw new Error("コンテンツの変換に失敗しました");
    }

    this.logger.info("Markdown変換完了", {
      url,
      markdownLength: data.result.length,
    });

    return data.result;
  }
}
