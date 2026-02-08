import type {
  AiSummarizer,
  AiSummaryResult,
} from "@/server/domain/knowledge/ports/ai-summarizer";

export class CloudflareAiSummarizer implements AiSummarizer {
  constructor(private readonly ai: Ai) {}

  async generateSummaryAndTags(content: string) {
    let response: { response?: string | AiSummaryResult };
    try {
      response = (await this.ai.run(
        "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
        {
          messages: [
            {
              role: "system",
              content:
                "あなたは日本語で記事を要約するアシスタントです。記事に書かれている具体的な技術・手法・結論・数値などの中身を要約してください。「〜についての記事です」のような概要説明ではなく、読者が記事を読まなくても要点がわかるような要約にしてください。",
            },
            {
              role: "user",
              content: `以下の記事の具体的な内容を日本語で要約し、関連タグを最大5つ生成してください。\n\n${content}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: "3〜5文の日本語要約",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "関連タグ（最大5つ）",
                },
              },
              required: ["summary", "tags"],
            },
          },
        },
      )) as { response?: string | AiSummaryResult };
    } catch (e) {
      console.error("[ai-summarizer] ai.run failed:", e);
      return { summary: "要約を生成できませんでした。", tags: [] };
    }

    const raw = response?.response;

    const parsed: AiSummaryResult | null =
      typeof raw === "object" && raw !== null
        ? (raw as AiSummaryResult)
        : (() => {
            try {
              return JSON.parse(raw as string);
            } catch {
              return null;
            }
          })();

    if (!parsed) {
      console.error("[ai-summarizer] Failed to parse AI response");
      return { summary: "要約を生成できませんでした。", tags: [] };
    }

    return {
      summary: parsed.summary || "要約を生成できませんでした。",
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    };
  }
}
