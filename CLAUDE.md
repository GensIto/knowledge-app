# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Dev server (port 3000)
npm run build            # Production build
npm run test             # Run vitest
npm run deploy           # Build & deploy to Cloudflare Workers
npm run cf-typegen       # Regenerate worker-configuration.d.ts
npm run db:gen           # Generate Drizzle migration (interactive)
npm run db:migrate       # Apply migrations locally
npm run db:migrate:remote # Apply migrations to remote D1
npm run db:studio        # Drizzle Studio (local)
```

## Architecture

DDD + Clean Architecture with Ditox DI container on Cloudflare Workers + TanStack Start.

```
src/
  server/                   # All server-side code
    domain/knowledge/       # Pure domain — no external dependencies
      entities/             # KnowledgeItem (private ctor, create/reconstitute factories)
      ports/                # Interfaces: ContentFetcher, AiSummarizer
      repositories/         # Interface: KnowledgeRepository
      services/             # Pure functions (extractTitle)

    application/knowledge/  # Use cases — depends only on domain
      commands/             # ExtractAndSaveUseCase, DeleteKnowledgeUseCase
      queries/              # ListKnowledgeUseCase

    infrastructure/         # Implementations — depends on domain + external libs
      gateway/              # CloudflareContentFetcher, CloudflareAiSummarizer
      repository/           # DrizzleKnowledgeRepository (D1)
      auth/                 # Better Auth setup + requireAuth helper

    di/                     # Composition root
      tokens.ts             # Typed Ditox tokens
      container.ts          # createRequestContainer(env) — per-request scoped

    interface/              # TanStack Start server functions (presentation layer)

  db/schema.ts              # Drizzle schema (Better Auth + knowledge_item)
  routes/                   # File-based routing (_authenticated/ for protected pages)
  components/ui/            # Shadcn components
  shared/schema/            # Zod validation schemas
```

### Dependency rule

Domain ← Application ← Infrastructure/Presentation. Only `server/di/container.ts` (composition root) imports from all layers.

### Cloudflare Workers env

`env` is only available at request time via `import { env } from "cloudflare:workers"`. The DI container is created per-request inside server function handlers:

```typescript
const container = createRequestContainer(env);
const useCase = container.resolve(EXTRACT_AND_SAVE_UC_TOKEN);
```

Bindings: `DB` (D1), `AI` (Workers AI), `BUCKET` (R2), `QUEUE` (Queues).

## Key Conventions

- **Japanese UI**: All user-facing text, error messages, and AI prompts are in Japanese
- **AI model**: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` with `response_format: { type: "json_schema" }` — response may be a parsed object or JSON string, handle both
- **Auth**: `requireAuth(env)` in server functions, `useSession()` on client. Auth is a cross-cutting concern handled in the presentation layer, not in use cases
- **Path alias**: `@/` maps to `./src/`
- **Database**: Cloudflare D1 (SQLite) via Drizzle ORM. Migrations in `./drizzle/`. Tags stored as JSON array column
