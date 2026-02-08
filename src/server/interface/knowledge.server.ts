import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { z } from "zod";
import { createRequestContainer } from "@/server/di/container";
import { requireAuth } from "@/server/infrastructure/auth/require-auth";
import { createKnowledgeSchema } from "@/shared/schema/knowledgeSchema";
import {
  EXTRACT_AND_SAVE_UC_TOKEN,
  LIST_KNOWLEDGE_UC_TOKEN,
  DELETE_KNOWLEDGE_UC_TOKEN,
  SEARCH_KNOWLEDGE_UC_TOKEN,
} from "@/server/di/tokens";

export const extractAndSummarize = createServerFn({ method: "POST" })
  .inputValidator(createKnowledgeSchema)
  .handler(async ({ data }) => {
    const user = await requireAuth(env);
    const container = createRequestContainer(env);
    const useCase = container.resolve(EXTRACT_AND_SAVE_UC_TOKEN);
    return useCase.execute({ url: data.url, userId: user.id });
  });

export const listKnowledge = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await requireAuth(env);
    const container = createRequestContainer(env);
    const useCase = container.resolve(LIST_KNOWLEDGE_UC_TOKEN);
    return useCase.execute(user.id);
  },
);

export const deleteKnowledge = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const user = await requireAuth(env);
    const container = createRequestContainer(env);
    const useCase = container.resolve(DELETE_KNOWLEDGE_UC_TOKEN);
    await useCase.execute(data.id, user.id);
    return { success: true };
  });

export const searchKnowledge = createServerFn({ method: "POST" })
  .inputValidator(z.object({ query: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requireAuth(env);
    const container = createRequestContainer(env);
    const useCase = container.resolve(SEARCH_KNOWLEDGE_UC_TOKEN);
    return useCase.execute(data.query);
  });
