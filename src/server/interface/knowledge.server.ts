import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { z } from "zod";
import { createRequestContainer } from "@/server/di/container";
import { requireAuth } from "@/server/infrastructure/auth/require-auth";
import { createKnowledgeSchema } from "@/shared/schema/knowledgeSchema";
import {
  LOGGER_TOKEN,
  EXTRACT_AND_SAVE_UC_TOKEN,
  LIST_KNOWLEDGE_UC_TOKEN,
  DELETE_KNOWLEDGE_UC_TOKEN,
  SEARCH_KNOWLEDGE_UC_TOKEN,
} from "@/server/di/tokens";

export const extractAndSummarize = createServerFn({ method: "POST" })
  .inputValidator(createKnowledgeSchema)
  .handler(async ({ data }) => {
    const container = createRequestContainer(env);
    const logger = container.resolve(LOGGER_TOKEN).child({
      layer: "interface",
      endpoint: "extractAndSummarize",
    });

    logger.info("リクエスト受信", { url: data.url });
    const startTime = Date.now();

    try {
      const user = await requireAuth(env);
      logger.debug("認証完了", { userId: user.id });

      const useCase = container.resolve(EXTRACT_AND_SAVE_UC_TOKEN);
      const result = await useCase.execute({ url: data.url, userId: user.id });

      const duration = Date.now() - startTime;
      logger.info("リクエスト処理完了", {
        url: data.url,
        userId: user.id,
        itemId: result.id,
        durationMs: duration,
      });

      return result;
    } catch (e) {
      const duration = Date.now() - startTime;
      logger.error("リクエスト処理失敗", {
        url: data.url,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }
  });

export const listKnowledge = createServerFn({ method: "GET" }).handler(
  async () => {
    const container = createRequestContainer(env);
    const logger = container.resolve(LOGGER_TOKEN).child({
      layer: "interface",
      endpoint: "listKnowledge",
    });

    logger.info("リクエスト受信");
    const startTime = Date.now();

    try {
      const user = await requireAuth(env);
      logger.debug("認証完了", { userId: user.id });

      const useCase = container.resolve(LIST_KNOWLEDGE_UC_TOKEN);
      const result = await useCase.execute(user.id);

      const duration = Date.now() - startTime;
      logger.info("リクエスト処理完了", {
        userId: user.id,
        itemsCount: result.length,
        durationMs: duration,
      });

      return result;
    } catch (e) {
      const duration = Date.now() - startTime;
      logger.error("リクエスト処理失敗", {
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }
  },
);

export const deleteKnowledge = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const container = createRequestContainer(env);
    const logger = container.resolve(LOGGER_TOKEN).child({
      layer: "interface",
      endpoint: "deleteKnowledge",
    });

    logger.info("リクエスト受信", { id: data.id });
    const startTime = Date.now();

    try {
      const user = await requireAuth(env);
      logger.debug("認証完了", { userId: user.id });

      const useCase = container.resolve(DELETE_KNOWLEDGE_UC_TOKEN);
      await useCase.execute(data.id, user.id);

      const duration = Date.now() - startTime;
      logger.info("リクエスト処理完了", {
        id: data.id,
        userId: user.id,
        durationMs: duration,
      });

      return { success: true };
    } catch (e) {
      const duration = Date.now() - startTime;
      logger.error("リクエスト処理失敗", {
        id: data.id,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }
  });

export const searchKnowledge = createServerFn({ method: "POST" })
  .inputValidator(z.object({ query: z.string().min(1) }))
  .handler(async ({ data }) => {
    const container = createRequestContainer(env);
    const logger = container.resolve(LOGGER_TOKEN).child({
      layer: "interface",
      endpoint: "searchKnowledge",
    });

    logger.info("リクエスト受信", { query: data.query });
    const startTime = Date.now();

    try {
      const user = await requireAuth(env);
      logger.debug("認証完了", { userId: user.id });

      const useCase = container.resolve(SEARCH_KNOWLEDGE_UC_TOKEN);
      const result = await useCase.execute(data.query);

      const duration = Date.now() - startTime;
      logger.info("リクエスト処理完了", {
        query: data.query,
        userId: user.id,
        sourcesCount: result.sources.length,
        durationMs: duration,
      });

      return result;
    } catch (e) {
      const duration = Date.now() - startTime;
      logger.error("リクエスト処理失敗", {
        query: data.query,
        durationMs: duration,
        error: e instanceof Error ? e.message : String(e),
        stack: e instanceof Error ? e.stack : undefined,
      });
      throw e;
    }
  });
