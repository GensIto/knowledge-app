import { createAuth } from "@/server/infrastructure/auth/auth";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

async function handleAuthRequest(request: Request) {
  const auth = createAuth(env);
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return await handleAuthRequest(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return await handleAuthRequest(request);
      },
    },
  },
});
