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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OCCURRENCE_STATUSES,
  STATUS_LABELS,
  type OccurrenceStatus,
} from "@/lib/constants";
import type { ActionResult } from "@/lib/types";

export function OccurrenceDetailActions({
  code,
  status,
  canEdit,
  canDelete,
  canChangeStatus,
  editHref,
  listHref,
  onChangeStatus,
  onDelete,
}: {
  code: string;
  status: OccurrenceStatus;
  canEdit: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  editHref: string;
  listHref: string;
  onChangeStatus?: (code: string, status: string) => Promise<ActionResult>;
  onDelete: (code: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmStatus, setConfirmStatus] = useState<OccurrenceStatus | null>(
    null
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  function applyStatus(next: OccurrenceStatus) {
    if (!onChangeStatus) return;
    startTransition(async () => {
      const result = await onChangeStatus(code, next);
      if (!result.success) {
        toast.error(result.message ?? "Não foi possível alterar o status.");
        return;
      }
      toast.success(result.message ?? "Status atualizado.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {canEdit ? (
          <Button variant="outline" onClick={() => router.push(editHref)}>
            Editar
          </Button>
        ) : null}
        {canDelete ? (
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            Excluir
          </Button>
        ) : null}
      </div>

      {canChangeStatus && onChangeStatus ? (
        <div className="max-w-xs">
          <Select
            value={status}
            disabled={isPending}
            onValueChange={(value) => {
              const next = value as OccurrenceStatus;
              if (next === "resolved" || next === "cancelled") {
                setConfirmStatus(next);
              } else {
                applyStatus(next);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {OCCURRENCE_STATUSES.map((item) => (
                  <SelectItem
                    key={item}
                    value={item}
                    disabled={item === status}
                  >
                    {STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <AlertDialog
        open={confirmStatus !== null}
        onOpenChange={() => setConfirmStatus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar ocorrência?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmStatus === "resolved"
                ? "Marcar como resolvida é irreversível neste V1."
                : "Cancelar é irreversível neste V1. A ocorrência ficará somente leitura."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmStatus) applyStatus(confirmStatus);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ocorrência?</AlertDialogTitle>
            <AlertDialogDescription>
              Ela some das listas e não poderá ser recuperada. Encerrar com
              Cancelado mantém o histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                startTransition(async () => {
                  const result = await onDelete(code);
                  if (!result.success) {
                    toast.error(result.message ?? "Não foi possível excluir.");
                    return;
                  }
                  toast.success(result.message);
                  router.push(listHref);
                  router.refresh();
                });
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
