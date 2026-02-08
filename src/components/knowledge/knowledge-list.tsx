import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { TrashIcon, ExternalLinkIcon } from "lucide-react";
import {
  deleteKnowledge,
  listKnowledge,
} from "@/server/interface/knowledge.server";
import { toast } from "sonner";

export default function KnowledgeListItem({
  item,
}: {
  item: Awaited<ReturnType<typeof listKnowledge>>[number];
}) {
  const handleDelete = async (id: string) => {
    try {
      await deleteKnowledge({ data: { id } });
      toast.success("ナレッジを削除しました");
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  return (
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
  );
}
