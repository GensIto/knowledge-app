import { createContainer } from "ditox";
import { nanoid } from "nanoid";
import { drizzle } from "drizzle-orm/d1";
import * as dbSchema from "@/db/schema";
import { createPinoLogger } from "@/server/infrastructure/logger/pino-logger";
import { CloudflareContentFetcher } from "@/server/infrastructure/gateway/cloudflare-content-fetcher";
import { CloudflareAiSummarizer } from "@/server/infrastructure/gateway/cloudflare-ai-summarizer";
import { CloudflareContentStorage } from "@/server/infrastructure/gateway/cloudflare-content-storage";
import { AutoRagKnowledgeSearcher } from "@/server/infrastructure/gateway/autorag-knowledge-searcher";
import { DrizzleKnowledgeRepository } from "@/server/infrastructure/repository/knowledge-repository.impl";
import { ExtractAndSaveUseCase } from "@/server/application/knowledge/commands/extract-and-save";
import { ListKnowledgeUseCase } from "@/server/application/knowledge/queries/list-knowledge";
import { DeleteKnowledgeUseCase } from "@/server/application/knowledge/commands/delete-knowledge";
import { SearchKnowledgeUseCase } from "@/server/application/knowledge/queries/search-knowledge";
import type { LogLevel } from "@/server/domain/knowledge/ports/logger";
import {
  LOGGER_TOKEN,
  CONTENT_FETCHER_TOKEN,
  AI_SUMMARIZER_TOKEN,
  KNOWLEDGE_REPOSITORY_TOKEN,
  CONTENT_STORAGE_TOKEN,
  KNOWLEDGE_SEARCHER_TOKEN,
  EXTRACT_AND_SAVE_UC_TOKEN,
  LIST_KNOWLEDGE_UC_TOKEN,
  DELETE_KNOWLEDGE_UC_TOKEN,
  SEARCH_KNOWLEDGE_UC_TOKEN,
} from "./tokens";

export function createRequestContainer(env: Env) {
  const container = createContainer();
  const db = drizzle(env.DB, { schema: dbSchema });

  // リクエストIDを生成（全ログに付与される）
  const requestId = nanoid();

  // ログレベルを環境変数から取得（デフォルト: info）
  const logLevel = (env.LOG_LEVEL as LogLevel | undefined) ?? "info";

  // Infrastructure bindings
  container.bindFactory(
    LOGGER_TOKEN,
    () => createPinoLogger({ level: logLevel, requestId }),
    { scope: "scoped" },
  );

  container.bindFactory(
    CONTENT_FETCHER_TOKEN,
    () =>
      new CloudflareContentFetcher(
        env.CLOUDFLARE_ACCOUNT_ID,
        env.CLOUDFLARE_BROWSER_RENDERING_TOKEN,
        container.resolve(LOGGER_TOKEN),
      ),
    { scope: "scoped" },
  );

  container.bindFactory(
    AI_SUMMARIZER_TOKEN,
    () =>
      new CloudflareAiSummarizer(env.AI, container.resolve(LOGGER_TOKEN)),
    { scope: "scoped" },
  );

  container.bindFactory(
    KNOWLEDGE_REPOSITORY_TOKEN,
    () => new DrizzleKnowledgeRepository(db, container.resolve(LOGGER_TOKEN)),
    { scope: "scoped" },
  );

  container.bindFactory(
    CONTENT_STORAGE_TOKEN,
    () =>
      new CloudflareContentStorage(env.BUCKET, container.resolve(LOGGER_TOKEN)),
    { scope: "scoped" },
  );

  container.bindFactory(
    KNOWLEDGE_SEARCHER_TOKEN,
    () => new AutoRagKnowledgeSearcher(env.AI, container.resolve(LOGGER_TOKEN)),
    { scope: "scoped" },
  );

  // Use case bindings
  container.bindFactory(
    EXTRACT_AND_SAVE_UC_TOKEN,
    () =>
      new ExtractAndSaveUseCase(
        container.resolve(CONTENT_FETCHER_TOKEN),
        container.resolve(AI_SUMMARIZER_TOKEN),
        container.resolve(KNOWLEDGE_REPOSITORY_TOKEN),
        container.resolve(CONTENT_STORAGE_TOKEN),
        container.resolve(LOGGER_TOKEN),
      ),
    { scope: "scoped" },
  );

  container.bindFactory(
    LIST_KNOWLEDGE_UC_TOKEN,
    () =>
      new ListKnowledgeUseCase(
        container.resolve(KNOWLEDGE_REPOSITORY_TOKEN),
        container.resolve(LOGGER_TOKEN),
      ),
    { scope: "scoped" },
  );

  container.bindFactory(
    DELETE_KNOWLEDGE_UC_TOKEN,
    () =>
      new DeleteKnowledgeUseCase(
        container.resolve(KNOWLEDGE_REPOSITORY_TOKEN),
        container.resolve(CONTENT_STORAGE_TOKEN),
        container.resolve(LOGGER_TOKEN),
      ),
    { scope: "scoped" },
  );

  container.bindFactory(
    SEARCH_KNOWLEDGE_UC_TOKEN,
    () =>
      new SearchKnowledgeUseCase(
        container.resolve(KNOWLEDGE_SEARCHER_TOKEN),
        container.resolve(LOGGER_TOKEN),
      ),
    { scope: "scoped" },
  );

  return container;
}
