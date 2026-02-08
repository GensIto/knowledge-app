import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { BookOpenIcon } from "lucide-react";

export default function KnowledgeEmpty() {
  return (
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
  );
}
