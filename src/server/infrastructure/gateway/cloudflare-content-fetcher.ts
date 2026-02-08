import type { ContentFetcher } from "@/server/domain/knowledge/ports/content-fetcher";

export class CloudflareContentFetcher implements ContentFetcher {
  constructor(
    private readonly accountId: string,
    private readonly apiToken: string,
  ) {}

  async fetchMarkdown(url: string) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/browser-rendering/markdown`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      },
    );

    if (!response.ok) {
      throw new Error(`コンテンツの取得に失敗しました: ${response.status}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      result: string;
    };

    if (!data.success || !data.result) {
      throw new Error("コンテンツの変換に失敗しました");
    }

    return data.result;
  }
}
