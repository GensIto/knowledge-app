import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .string()
    .email("有効なメールアドレスを入力してください")
    .min(1, "メールアドレスは必須です"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上である必要があります")
    .max(100, "パスワードは100文字以下である必要があります")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "パスワードは大文字、小文字、数字を含む必要があります",
    ),
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以下である必要があります"),
});
