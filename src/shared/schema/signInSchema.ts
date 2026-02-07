import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .email("有効なメールアドレスを入力してください")
    .min(1, "メールアドレスは必須です"),
  password: z.string().min(1, "パスワードは必須です"),
});
