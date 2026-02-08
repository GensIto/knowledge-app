import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createKnowledgeSchema } from "@/shared/schema/knowledgeSchema";
import {
  extractAndSummarize,
  listKnowledge,
  deleteKnowledge,
  searchKnowledge,
} from "@/server/interface/knowledge.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  PlusIcon,
  TrashIcon,
  ExternalLinkIcon,
  BookOpenIcon,
  SearchIcon,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/knowledge")({
  component: KnowledgePage,
});

interface KnowledgeItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  createdAt: string;
}

interface SearchResult {
  response: string;
  sources: { filename: string; score: number; content: string }[];
}

function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    listKnowledge().then(setItems).catch(console.error);
  }, []);

  const form = useForm({
    defaultValues: { url: "" },
    validators: { onSubmit: createKnowledgeSchema },
    onSubmit: async ({ value }) => {
      try {
        const result = await extractAndSummarize({ data: value });
        setItems((prev) => [result, ...prev]);
        toast.success("ナレッジを追加しました");
        setDialogOpen(false);
        form.reset();
      } catch {
        toast.error("ナレッジの作成に失敗しました。URLを確認してください。");
      }
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteKnowledge({ data: { id } });
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("ナレッジを削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

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
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon />
                    追加
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>ナレッジを追加</DialogTitle>
                    <DialogDescription>
                      URLを入力すると、コンテンツを抽出してAIが要約とタグを生成します
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      form.handleSubmit();
                    }}
                    className='space-y-4'
                  >
                    <form.Field name='url'>
                      {(field) => (
                        <div>
                          <Label htmlFor='url'>URL</Label>
                          <Input
                            type='url'
                            id='url'
                            name='url'
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder='https://example.com/article'
                            disabled={form.state.isSubmitting}
                          />
                          {field.state.meta.errors.length > 0 && (
                            <p className='mt-1 text-sm text-red-400'>
                              {String(field.state.meta.errors[0])}
                            </p>
                          )}
                        </div>
                      )}
                    </form.Field>
                    <DialogFooter>
                      <Button type='submit' disabled={form.state.isSubmitting}>
                        {form.state.isSubmitting ? (
                          <>
                            <Spinner />
                            処理中...
                          </>
                        ) : (
                          "保存"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
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

        {items.length === 0 && !searchResult && (
          <Card className='backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'>
            <CardContent>
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <BookOpenIcon />
                  </EmptyMedia>
                  <EmptyTitle>ナレッジがありません</EmptyTitle>
                  <EmptyDescription>
                    URLを追加して、AIによる要約とタグ付けを始めましょう
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        )}

        {items.map((item) => (
          <Card
            key={item.id}
            className='backdrop-blur-md bg-black/50 shadow-xl border border-zinc-800'
          >
            <CardHeader>
              <CardTitle className='text-lg font-bold text-white'>
                {item.title}
              </CardTitle>
              <CardAction>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={() => handleDelete(item.id)}
                  className='text-zinc-400 hover:text-red-400'
                >
                  <TrashIcon />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p className='text-zinc-300 text-sm'>{item.summary}</p>
              <div className='flex flex-wrap gap-1.5'>
                {item.tags.map((tag) => (
                  <Badge key={tag} variant='secondary'>
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className='flex items-center justify-between'>
              <a
                href={item.url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1'
              >
                <ExternalLinkIcon className='size-3' />
                {new URL(item.url).hostname}
              </a>
              <span className='text-xs text-zinc-500'>
                {new Date(item.createdAt).toLocaleDateString("ja-JP")}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
