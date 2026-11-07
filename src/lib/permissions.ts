import type { OccurrenceStatus } from "@/lib/constants";
import type { Actor } from "@/lib/types";

export function isLockedStatus(status: OccurrenceStatus) {
  return status === "resolved" || status === "cancelled";
}

export function canEditOccurrence(
  actor: Actor,
  occurrence: { status: OccurrenceStatus; authorResidentId: number | null }
) {
  if (isLockedStatus(occurrence.status)) {
    return false;
  }
  if (actor.kind === "staff") {
    return true;
  }
  return occurrence.authorResidentId === actor.id;
}

export function canDeleteOccurrence(
  actor: Actor,
  occurrence: { status: OccurrenceStatus; authorResidentId: number | null }
) {
  return canEditOccurrence(actor, occurrence);
}

export function canChangeStatus(actor: Actor, status: OccurrenceStatus) {
  return actor.kind === "staff" && !isLockedStatus(status);
}

export function canComment(status: OccurrenceStatus) {
  return !isLockedStatus(status);
}

export function isCommentAuthor(
  actor: Actor,
  comment: { authorStaffId: string | null; authorResidentId: number | null }
) {
  if (actor.kind === "staff") {
    return comment.authorStaffId === actor.id;
  }
  return comment.authorResidentId === actor.id;
}
