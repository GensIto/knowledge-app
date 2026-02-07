import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { createKnowledgeSchema } from "@/shared/schema/knowledgeSchema";
import { createAuth } from "@/lib/auth";

async function requireAuth() {
  const request = getRequest();
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw new Error("認証が必要です");
  }
  return session.user;
}

async function fetchMarkdown(url: string): Promise<string> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/browser-rendering/markdown`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_BROWSER_RENDERING_TOKEN}`,
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

function extractTitle(markdown: string, url: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

interface AiResult {
  summary: string;
  tags: string[];
}

async function generateSummaryAndTags(
  ai: Ai,
  content: string,
): Promise<AiResult> {
  console.log("[knowledge] AI input content length:", content.length);

  let response: { response?: string | AiResult };
  try {
    response = (await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
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
            summary: { type: "string", description: "3〜5文の日本語要約" },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "関連タグ（最大5つ）",
            },
          },
          required: ["summary", "tags"],
        },
      },
    })) as { response?: string | AiResult };
  } catch (e) {
    console.error("[knowledge] ai.run failed:", e);
    return { summary: "要約を生成できませんでした。", tags: [] };
  }

  const raw = response?.response;
  console.log("[knowledge] AI response:", typeof raw, raw);

  const parsed: AiResult =
    typeof raw === "object" && raw !== null
      ? (raw as AiResult)
      : (() => {
          try {
            return JSON.parse(raw as string);
          } catch {
            return null;
          }
        })();

  if (!parsed) {
    console.error("[knowledge] Failed to parse AI response");
    return { summary: "要約を生成できませんでした。", tags: [] };
  }

  return {
    summary: parsed.summary || "要約を生成できませんでした。",
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
  };
}

export const extractAndSummarize = createServerFn({ method: "POST" })
  .inputValidator(createKnowledgeSchema)
  .handler(async ({ data }) => {
    console.log("[knowledge] Starting extractAndSummarize for:", data.url);

    try {
      await requireAuth();
      console.log("[knowledge] Auth OK");
    } catch (e) {
      console.error("[knowledge] Auth failed:", e);
      throw e;
    }

    let markdown: string;
    try {
      markdown = await fetchMarkdown(data.url);
      console.log("[knowledge] Markdown fetched, length:", markdown.length);
    } catch (e) {
      console.error("[knowledge] fetchMarkdown failed:", e);
      throw e;
    }

    const title = extractTitle(markdown, data.url);
    console.log("[knowledge] Title:", title);

    const { summary, tags } = await generateSummaryAndTags(env.AI, markdown);
    console.log(
      "[knowledge] AI done, summary length:",
      summary.length,
      "tags:",
      tags.length,
    );

    return {
      id: crypto.randomUUID(),
      url: data.url,
      title,
      summary,
      tags,
      createdAt: new Date().toISOString(),
    };
  });
