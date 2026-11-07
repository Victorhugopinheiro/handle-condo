"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import type { ActionResult } from "@/lib/types";

export type CommentItem = {
  id: number;
  body: string;
  isEdited: boolean;
  createdAt: Date;
  authorName: string;
  authorRole: string;
  isOwn: boolean;
};

export function CommentsThread({
  code,
  comments,
  canAdd,
  onAdd,
  onEdit,
  onDelete,
}: {
  code: string;
  comments: CommentItem[];
  canAdd: boolean;
  onAdd: (code: string, body: string) => Promise<ActionResult>;
  onEdit: (id: number, body: string) => Promise<ActionResult>;
  onDelete: (id: number) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(task: () => Promise<ActionResult>, onSuccess?: () => void) {
    startTransition(async () => {
      const result = await task();
      if (!result.success) {
        toast.error(result.message ?? "Não foi possível concluir.");
        return;
      }
      toast.success(result.message);
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold">Comentários</h2>
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum comentário ainda.
        </p>
      ) : (
        <ol className="flex flex-col gap-4">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">
                  {comment.authorName}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {comment.authorRole}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(comment.createdAt)}
                  {comment.isEdited ? " · editado" : ""}
                </p>
              </div>
              {editingId === comment.id ? (
                <div className="mt-3 flex flex-col gap-2">
                  <Textarea
                    value={editingBody}
                    onChange={(event) => setEditingBody(event.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () => onEdit(comment.id, editingBody),
                          () => setEditingId(null)
                        )
                      }
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {comment.body}
                </p>
              )}
              {comment.isOwn && canAdd && editingId !== comment.id ? (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditingBody(comment.body);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(comment.id)}
                  >
                    Apagar
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}

      {canAdd ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            run(
              () => onAdd(code, body),
              () => setBody("")
            );
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="comment">Novo comentário</FieldLabel>
              <Textarea
                id="comment"
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={isPending || !body.trim()}>
            Publicar
          </Button>
        </form>
      ) : null}

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar comentário?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  run(
                    () => onDelete(deleteId),
                    () => setDeleteId(null)
                  );
                }
              }}
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
