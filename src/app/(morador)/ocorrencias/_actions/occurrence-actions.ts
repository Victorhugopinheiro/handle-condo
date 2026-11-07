"use server";

import { revalidatePath } from "next/cache";
import {
  addCommentCommand,
  createOccurrenceCommand,
  deleteCommentCommand,
  deleteOccurrenceCommand,
  editCommentCommand,
  filesFromForm,
  updateOccurrenceCommand,
} from "@/lib/occurrences/commands";
import type { OccurrenceFormValues } from "@/lib/occurrences/schema";
import { requireResident } from "@/lib/session";
import type { ActionResult } from "@/lib/types";

function revalidateAll() {
  revalidatePath("/dashboard/ocorrencias");
  revalidatePath("/ocorrencias");
}

export async function createResidentOccurrence(
  input: OccurrenceFormValues,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireResident();
  const result = await createOccurrenceCommand(
    actor,
    input,
    filesFromForm(formData)
  );
  if (result.success) revalidateAll();
  return result;
}

export async function updateResidentOccurrence(
  code: string,
  input: OccurrenceFormValues,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireResident();
  const removePhotoIds = formData
    .getAll("removePhotoIds")
    .map((value) => Number(value))
    .filter(Number.isFinite);
  const result = await updateOccurrenceCommand(
    actor,
    code,
    input,
    filesFromForm(formData),
    removePhotoIds
  );
  if (result.success) revalidateAll();
  return result;
}

export async function deleteResidentOccurrence(
  code: string
): Promise<ActionResult> {
  const actor = await requireResident();
  const result = await deleteOccurrenceCommand(actor, code);
  if (result.success) revalidateAll();
  return result;
}

export async function addResidentComment(
  code: string,
  body: string
): Promise<ActionResult> {
  const actor = await requireResident();
  const result = await addCommentCommand(actor, code, body);
  if (result.success) revalidateAll();
  return result;
}

export async function editResidentComment(
  id: number,
  body: string
): Promise<ActionResult> {
  const actor = await requireResident();
  const result = await editCommentCommand(actor, id, body);
  if (result.success) revalidateAll();
  return result;
}

export async function deleteResidentComment(id: number): Promise<ActionResult> {
  const actor = await requireResident();
  const result = await deleteCommentCommand(actor, id);
  if (result.success) revalidateAll();
  return result;
}
