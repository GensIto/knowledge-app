import { token } from "ditox";
import type { ContentFetcher } from "@/server/domain/knowledge/ports/content-fetcher";
import type { AiSummarizer } from "@/server/domain/knowledge/ports/ai-summarizer";
import type { ContentStorage } from "@/server/domain/knowledge/ports/content-storage";
import type { KnowledgeSearcher } from "@/server/domain/knowledge/ports/knowledge-searcher";
import type { KnowledgeRepository } from "@/server/domain/knowledge/repositories/knowledge-repository";
import type { ExtractAndSaveUseCase } from "@/server/application/knowledge/commands/extract-and-save";
import type { ListKnowledgeUseCase } from "@/server/application/knowledge/queries/list-knowledge";
import type { DeleteKnowledgeUseCase } from "@/server/application/knowledge/commands/delete-knowledge";
import type { SearchKnowledgeUseCase } from "@/server/application/knowledge/queries/search-knowledge";

// Port tokens
export const CONTENT_FETCHER_TOKEN =
  token<ContentFetcher>("ContentFetcher");
export const AI_SUMMARIZER_TOKEN =
  token<AiSummarizer>("AiSummarizer");
export const KNOWLEDGE_REPOSITORY_TOKEN =
  token<KnowledgeRepository>("KnowledgeRepository");
export const CONTENT_STORAGE_TOKEN =
  token<ContentStorage>("ContentStorage");
export const KNOWLEDGE_SEARCHER_TOKEN =
  token<KnowledgeSearcher>("KnowledgeSearcher");

// Use case tokens
export const EXTRACT_AND_SAVE_UC_TOKEN =
  token<ExtractAndSaveUseCase>("ExtractAndSaveUseCase");
export const LIST_KNOWLEDGE_UC_TOKEN =
  token<ListKnowledgeUseCase>("ListKnowledgeUseCase");
export const DELETE_KNOWLEDGE_UC_TOKEN =
  token<DeleteKnowledgeUseCase>("DeleteKnowledgeUseCase");
export const SEARCH_KNOWLEDGE_UC_TOKEN =
  token<SearchKnowledgeUseCase>("SearchKnowledgeUseCase");
