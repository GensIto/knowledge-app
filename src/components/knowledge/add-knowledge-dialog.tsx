import { Button } from "@/components/ui/button";
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { extractAndSummarize } from "@/server/interface/knowledge.server";
import { createKnowledgeSchema } from "@/shared/schema/knowledgeSchema";
import { useForm } from "@tanstack/react-form";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function AddKnowledgeDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm({
    defaultValues: { url: "" },
    validators: { onSubmit: createKnowledgeSchema },
    onSubmit: async ({ value }) => {
      try {
        await extractAndSummarize({ data: value });
        toast.success("ナレッジを追加しました");
        setDialogOpen(false);
        form.reset();
      } catch {
        toast.error("ナレッジの作成に失敗しました。URLを確認してください。");
      }
    },
  });

  return (
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
  );
}
