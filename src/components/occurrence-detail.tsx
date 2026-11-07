import Link from "next/link";
import { CommentsThread } from "@/components/comments-thread";
import { OccurrenceDetailActions } from "@/components/occurrence-detail-actions";
import { StatusBadge } from "@/components/status-badge";
import { Separator } from "@/components/ui/separator";
import type { OccurrenceStatus } from "@/lib/constants";
import { authorLabel, formatDateTime } from "@/lib/format";
import {
  canChangeStatus,
  canComment,
  canDeleteOccurrence,
  canEditOccurrence,
  isCommentAuthor,
} from "@/lib/permissions";
import type { ActionResult, Actor } from "@/lib/types";

type Detail = {
  code: string;
  title: string;
  description: string;
  status: OccurrenceStatus;
  locationValue: string;
  categoryName: string;
  openedAt: Date;
  closedAt: Date | null;
  authorStaffId: string | null;
  authorResidentId: number | null;
  authorStaffName: string | null;
  authorResidentName: string | null;
  authorResidentUnit: string | null;
};

export function OccurrenceDetailView({
  actor,
  occurrence,
  photos,
  comments,
  listHref,
  editHref,
  onChangeStatus,
  onDelete,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: {
  actor: Actor;
  occurrence: Detail;
  photos: { id: number; url: string }[];
  comments: Array<{
    id: number;
    body: string;
    isEdited: boolean;
    createdAt: Date;
    authorStaffId: string | null;
    authorResidentId: number | null;
    authorStaffName: string | null;
    authorResidentName: string | null;
  }>;
  listHref: string;
  editHref: string;
  onChangeStatus?: (code: string, status: string) => Promise<ActionResult>;
  onDelete: (code: string) => Promise<ActionResult>;
  onAddComment: (code: string, body: string) => Promise<ActionResult>;
  onEditComment: (id: number, body: string) => Promise<ActionResult>;
  onDeleteComment: (id: number) => Promise<ActionResult>;
}) {
  const locked =
    occurrence.status === "resolved" || occurrence.status === "cancelled";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Link
            href={listHref}
            className="text-sm text-primary hover:underline"
          >
            Voltar à lista
          </Link>
          <p className="text-sm text-muted-foreground">{occurrence.code}</p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {occurrence.title}
          </h1>
          <StatusBadge status={occurrence.status} />
        </div>
        <OccurrenceDetailActions
          code={occurrence.code}
          status={occurrence.status}
          canEdit={canEditOccurrence(actor, occurrence)}
          canDelete={canDeleteOccurrence(actor, occurrence)}
          canChangeStatus={canChangeStatus(actor, occurrence.status)}
          editHref={editHref}
          listHref={listHref}
          onChangeStatus={onChangeStatus}
          onDelete={onDelete}
        />
      </div>

      <dl className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Categoria</dt>
          <dd>{occurrence.categoryName}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Local</dt>
          <dd>{occurrence.locationValue}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Autor</dt>
          <dd>{authorLabel(occurrence)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Abertura</dt>
          <dd>{formatDateTime(occurrence.openedAt)}</dd>
        </div>
        {occurrence.closedAt ? (
          <div>
            <dt className="text-sm text-muted-foreground">Encerramento</dt>
            <dd>{formatDateTime(occurrence.closedAt)}</dd>
          </div>
        ) : null}
      </dl>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-xl font-semibold">Descrição</h2>
        <p className="whitespace-pre-wrap text-sm leading-6">
          {occurrence.description}
        </p>
      </section>

      {photos.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-xl font-semibold">Fotos</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={photo.url}
                alt=""
                className="h-40 w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </section>
      ) : null}

      <Separator />

      <CommentsThread
        code={occurrence.code}
        canAdd={canComment(occurrence.status)}
        comments={comments.map((comment) => ({
          id: comment.id,
          body: comment.body,
          isEdited: comment.isEdited,
          createdAt: comment.createdAt,
          authorName:
            comment.authorStaffName ?? comment.authorResidentName ?? "—",
          authorRole: comment.authorStaffId ? "funcionário" : "morador",
          isOwn: isCommentAuthor(actor, comment),
        }))}
        onAdd={onAddComment}
        onEdit={onEditComment}
        onDelete={onDeleteComment}
      />

      {locked ? (
        <p className="text-sm text-muted-foreground">
          Esta ocorrência está encerrada e permanece somente leitura.
        </p>
      ) : null}
    </div>
  );
}
