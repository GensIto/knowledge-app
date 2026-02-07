import { z } from "zod";

export const createKnowledgeSchema = z.object({
  url: z
    .string()
    .url("有効なURLを入力してください")
    .min(1, "URLは必須です"),
});
