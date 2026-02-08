import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  listKnowledge,
  searchKnowledge,
} from "@/server/interface/knowledge.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { SearchIcon } from "lucide-react";
import KnowledgeEmpty from "@/components/knowledge/knowledge-empty";
import KnowledgeListItem from "@/components/knowledge/knowledge-list";
import AddKnowledgeDialog from "@/components/knowledge/add-knowledge-dialog";

export const Route = createFileRoute("/_authenticated/knowledge")({
  component: KnowledgePage,
  loader: async () => {
    const items = await listKnowledge();
    return { items };
  },
});

interface SearchResult {
  response: string;
  sources: { filename: string; score: number; content: string }[];
}

function KnowledgePage() {
  const { items } = Route.useLoaderData();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await searchKnowledge({ data: { query: searchQuery } });
      setSearchResult(result);
    } catch {
      toast.error("検索に失敗しました");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4'
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)",
      }}
    >
      <div className='max-w-4xl mx-auto space-y-4'>
        <Card className='backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold text-white'>
              ナレッジ
            </CardTitle>
            <CardDescription>
              URLからコンテンツを抽出し、AIで要約・タグ付けします
            </CardDescription>
            <CardAction>
              <AddKnowledgeDialog />
            </CardAction>
          </CardHeader>
        </Card>

        <Card className='backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
          <CardContent>
            <form onSubmit={handleSearch} className='flex gap-2'>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='ナレッジを検索...'
                disabled={isSearching}
                className='text-white'
              />
              <Button
                type='submit'
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? <Spinner /> : <SearchIcon className='size-4' />}
                検索
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchResult && (
          <Card className='backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
            <CardHeader>
              <CardTitle className='text-lg font-bold text-white'>
                検索結果
              </CardTitle>
              <CardAction>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setSearchResult(null);
                    setSearchQuery("");
                  }}
                  className='text-zinc-400'
                >
                  クリア
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-zinc-300 text-sm whitespace-pre-wrap'>
                {searchResult.response}
              </p>
              {searchResult.sources.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-xs text-zinc-500'>ソース:</p>
                  {searchResult.sources.map((source, i) => (
                    <div
                      key={i}
                      className='rounded border border-zinc-700 p-2 text-xs text-zinc-400'
                    >
                      <span className='text-zinc-500'>{source.filename}</span>
                      <span className='ml-2 text-zinc-600'>
                        (スコア: {source.score.toFixed(2)})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {items.length === 0 && !searchResult && <KnowledgeEmpty />}

        {items.map((item) => (
          <KnowledgeListItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
