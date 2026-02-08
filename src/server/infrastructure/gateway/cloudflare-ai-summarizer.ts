import type {
  AiSummarizer,
  AiSummaryResult,
} from "@/server/domain/knowledge/ports/ai-summarizer";
import type { Logger } from "@/server/domain/knowledge/ports/logger";

const AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

export class CloudflareAiSummarizer implements AiSummarizer {
  private readonly logger: Logger;

  constructor(ai: Ai, logger: Logger) {
    this.ai = ai;
    this.logger = logger.child({ layer: "infrastructure", component: "CloudflareAiSummarizer" });
  }

  private readonly ai: Ai;

  async generateSummaryAndTags(content: string) {
    const systemPrompt =
      "あなたは日本語で記事を要約するアシスタントです。記事に書かれている具体的な技術・手法・結論・数値などの中身を要約してください。「〜についての記事です」のような概要説明ではなく、読者が記事を読まなくても要点がわかるような要約にしてください。";
    const userPrompt = `以下の記事の具体的な内容を日本語で要約し、関連タグを最大5つ生成してください。\n\n${content}`;

    this.logger.info("AI要約処理を開始", {
      model: AI_MODEL,
      contentLength: content.length,
      systemPrompt,
      userPrompt: userPrompt.substring(0, 500), // プロンプト全文（長い場合は切り詰め）
    });

    const startTime = Date.now();
    let response: { response?: string | AiSummaryResult };

    try {
      response = (await this.ai.run(AI_MODEL, {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
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
      })) as { response?: string | AiSummaryResult };

      const duration = Date.now() - startTime;
      this.logger.info("AI API呼び出し成功", {
        model: AI_MODEL,
        durationMs: duration,
        responseType: typeof response?.response,
      });
    } catch (e) {
      const duration = Date.now() - startTime;
      this.logger.error("AI API呼び出し失敗", {
        model: AI_MODEL,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      return { summary: "要約を生成できませんでした。", tags: [] };
    }

    const raw = response?.response;

    // レスポンスのパース
    const parsed: AiSummaryResult | null =
      typeof raw === "object" && raw !== null
        ? (raw as AiSummaryResult)
        : (() => {
            try {
              return JSON.parse(raw as string);
            } catch {
              this.logger.warn("AI レスポンスのJSON パース失敗", {
                rawResponse: typeof raw === "string" ? raw.substring(0, 200) : String(raw),
              });
              return null;
            }
          })();

    if (!parsed) {
      this.logger.error("AI レスポンスのパース失敗", {
        rawResponse: String(raw).substring(0, 200),
      });
      return { summary: "要約を生成できませんでした。", tags: [] };
    }

    const result = {
      summary: parsed.summary || "要約を生成できませんでした。",
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    };

    this.logger.info("AI要約処理完了", {
      summaryLength: result.summary.length,
      tagsCount: result.tags.length,
      tags: result.tags,
    });

    return result;
  }
}
