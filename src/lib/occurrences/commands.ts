import { MAX_PHOTOS } from "@/lib/constants";
import {
  createComment,
  deleteComment,
  getCommentById,
  updateComment,
} from "@/lib/data/comments";
import { getCategoryById } from "@/lib/data/categories";
import {
  createOccurrenceRecord,
  deleteOccurrenceRecord,
  getOccurrenceByCode,
  getOccurrencePhotos,
  getOccurrenceStatusById,
  updateOccurrenceRecord,
  updateOccurrenceStatus,
} from "@/lib/data/occurrences";
import {
  deleteAllOccurrencePhotos,
  deletePhotosByIds,
  isImageFile,
  uploadOccurrencePhotos,
} from "@/lib/data/photos";
import {
  occurrenceFormSchema,
  occurrenceStatusSchema,
} from "@/lib/occurrences/schema";
import {
  canChangeStatus,
  canComment,
  canDeleteOccurrence,
  canEditOccurrence,
  isCommentAuthor,
  isLockedStatus,
} from "@/lib/permissions";
import type { ActionResult, Actor } from "@/lib/types";

export function filesFromForm(formData: FormData, key = "photos") {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export async function createOccurrenceCommand(
  actor: Actor,
  input: unknown,
  files: File[]
): Promise<ActionResult> {
  const parsed = occurrenceFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const category = await getCategoryById(parsed.data.categoryId);
  if (!category) {
    return { success: false, message: "Categoria inválida." };
  }

  if (files.length > MAX_PHOTOS) {
    return { success: false, message: `No máximo ${MAX_PHOTOS} fotos.` };
  }

  if (files.some((file) => !isImageFile(file))) {
    return {
      success: false,
      message: "Apenas arquivos de imagem são permitidos.",
    };
  }

  const occurrence = await createOccurrenceRecord({
    ...parsed.data,
    authorStaffId: actor.kind === "staff" ? actor.id : undefined,
    authorResidentId: actor.kind === "resident" ? actor.id : undefined,
  });

  let failed: string[] = [];
  if (files.length) {
    try {
      failed = await uploadOccurrencePhotos(occurrence.id, files);
    } catch {
      failed = files.map((file) => file.name || "arquivo");
    }
  }

  return {
    success: true,
    code: occurrence.code,
    message: "Ocorrência criada.",
    photoWarning: failed.length
      ? `A ocorrência foi salva, mas falhou o envio de: ${failed.join(", ")}. Tente de novo na edição.`
      : undefined,
  };
}

export async function updateOccurrenceCommand(
  actor: Actor,
  code: string,
  input: unknown,
  files: File[],
  removePhotoIds: number[]
): Promise<ActionResult> {
  const occurrence = await getOccurrenceByCode(code);
  if (!occurrence) {
    return { success: false, message: "Ocorrência não encontrada." };
  }

  if (!canEditOccurrence(actor, occurrence)) {
    return { success: false, message: "Você não pode editar esta ocorrência." };
  }

  const parsed = occurrenceFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const category = await getCategoryById(parsed.data.categoryId);
  if (!category) {
    return { success: false, message: "Categoria inválida." };
  }

  const currentPhotos = await getOccurrencePhotos(occurrence.id);
  const remaining = currentPhotos.filter(
    (photo) => !removePhotoIds.includes(photo.id)
  );
  if (remaining.length + files.length > MAX_PHOTOS) {
    return { success: false, message: `No máximo ${MAX_PHOTOS} fotos.` };
  }

  if (files.some((file) => !isImageFile(file))) {
    return {
      success: false,
      message: "Apenas arquivos de imagem são permitidos.",
    };
  }

  await updateOccurrenceRecord(occurrence.id, parsed.data);
  if (removePhotoIds.length) {
    await deletePhotosByIds(occurrence.id, removePhotoIds);
  }

  let failed: string[] = [];
  if (files.length) {
    try {
      failed = await uploadOccurrencePhotos(
        occurrence.id,
        files,
        remaining.length
      );
    } catch {
      failed = files.map((file) => file.name || "arquivo");
    }
  }

  return {
    success: true,
    code: occurrence.code,
    message: "Ocorrência atualizada.",
    photoWarning: failed.length
      ? `Os dados foram salvos, mas falhou o envio de: ${failed.join(", ")}.`
      : undefined,
  };
}

export async function changeStatusCommand(
  actor: Actor,
  code: string,
  status: unknown
): Promise<ActionResult> {
  const parsed = occurrenceStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { success: false, message: "Status inválido." };
  }

  const occurrence = await getOccurrenceByCode(code);
  if (!occurrence) {
    return { success: false, message: "Ocorrência não encontrada." };
  }

  if (!canChangeStatus(actor, occurrence.status)) {
    return {
      success: false,
      message: "Não é possível alterar o status desta ocorrência.",
    };
  }

  if (occurrence.status === parsed.data) {
    return { success: true, code: occurrence.code };
  }

  await updateOccurrenceStatus(occurrence.id, parsed.data);
  return {
    success: true,
    code: occurrence.code,
    message: "Status atualizado.",
  };
}

export async function deleteOccurrenceCommand(
  actor: Actor,
  code: string
): Promise<ActionResult> {
  const occurrence = await getOccurrenceByCode(code);
  if (!occurrence) {
    return { success: false, message: "Ocorrência não encontrada." };
  }

  if (!canDeleteOccurrence(actor, occurrence)) {
    return {
      success: false,
      message: "Você não pode excluir esta ocorrência.",
    };
  }

  await deleteAllOccurrencePhotos(occurrence.id);
  await deleteOccurrenceRecord(occurrence.id);
  return { success: true, message: "Ocorrência excluída." };
}

export async function addCommentCommand(
  actor: Actor,
  code: string,
  body: string
): Promise<ActionResult> {
  const occurrence = await getOccurrenceByCode(code);
  if (!occurrence) {
    return { success: false, message: "Ocorrência não encontrada." };
  }
  if (!canComment(occurrence.status)) {
    return { success: false, message: "Esta ocorrência está encerrada." };
  }
  const text = body.trim();
  if (!text) {
    return { success: false, errors: { body: ["Escreva um comentário"] } };
  }

  await createComment({
    occurrenceId: occurrence.id,
    body: text,
    authorStaffId: actor.kind === "staff" ? actor.id : undefined,
    authorResidentId: actor.kind === "resident" ? actor.id : undefined,
  });
  return { success: true, message: "Comentário publicado." };
}

export async function editCommentCommand(
  actor: Actor,
  commentId: number,
  body: string
): Promise<ActionResult> {
  const comment = await getCommentById(commentId);
  if (!comment) {
    return { success: false, message: "Comentário não encontrado." };
  }
  if (!isCommentAuthor(actor, comment)) {
    return {
      success: false,
      message: "Você só pode editar o próprio comentário.",
    };
  }

  const status = await getOccurrenceStatusById(comment.occurrenceId);
  if (!status || isLockedStatus(status)) {
    return { success: false, message: "Esta ocorrência está encerrada." };
  }

  const text = body.trim();
  if (!text) {
    return { success: false, errors: { body: ["Escreva um comentário"] } };
  }

  await updateComment(commentId, text);
  return { success: true, message: "Comentário atualizado." };
}

export async function deleteCommentCommand(
  actor: Actor,
  commentId: number
): Promise<ActionResult> {
  const comment = await getCommentById(commentId);
  if (!comment) {
    return { success: false, message: "Comentário não encontrado." };
  }
  if (!isCommentAuthor(actor, comment)) {
    return {
      success: false,
      message: "Você só pode apagar o próprio comentário.",
    };
  }

  const status = await getOccurrenceStatusById(comment.occurrenceId);
  if (!status || isLockedStatus(status)) {
    return { success: false, message: "Esta ocorrência está encerrada." };
  }

  await deleteComment(commentId);
  return { success: true, message: "Comentário removido." };
}
