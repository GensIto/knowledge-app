import { getRequest } from "@tanstack/react-start/server";
import { createAuth } from "./auth";

export async function requireAuth(env: Env) {
  const request = getRequest();
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw new Error("認証が必要です");
  }
  return session.user;
}
