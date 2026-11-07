"use server";

import { revalidatePath } from "next/cache";
import {
  addCommentCommand,
  changeStatusCommand,
  createOccurrenceCommand,
  deleteCommentCommand,
  deleteOccurrenceCommand,
  editCommentCommand,
  filesFromForm,
  updateOccurrenceCommand,
} from "@/lib/occurrences/commands";
import type { OccurrenceFormValues } from "@/lib/occurrences/schema";
import { requireStaff } from "@/lib/session";
import type { ActionResult } from "@/lib/types";

function revalidateAll() {
  revalidatePath("/dashboard/ocorrencias");
  revalidatePath("/ocorrencias");
}

export async function createStaffOccurrence(
  input: OccurrenceFormValues,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireStaff();
  const result = await createOccurrenceCommand(
    actor,
    input,
    filesFromForm(formData)
  );
  if (result.success) revalidateAll();
  return result;
}

export async function updateStaffOccurrence(
  code: string,
  input: OccurrenceFormValues,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireStaff();
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

export async function changeStaffStatus(
  code: string,
  status: string
): Promise<ActionResult> {
  const actor = await requireStaff();
  const result = await changeStatusCommand(actor, code, status);
  if (result.success) revalidateAll();
  return result;
}

export async function deleteStaffOccurrence(
  code: string
): Promise<ActionResult> {
  const actor = await requireStaff();
  const result = await deleteOccurrenceCommand(actor, code);
  if (result.success) revalidateAll();
  return result;
}

export async function addStaffComment(
  code: string,
  body: string
): Promise<ActionResult> {
  const actor = await requireStaff();
  const result = await addCommentCommand(actor, code, body);
  if (result.success) revalidateAll();
  return result;
}

export async function editStaffComment(
  id: number,
  body: string
): Promise<ActionResult> {
  const actor = await requireStaff();
  const result = await editCommentCommand(actor, id, body);
  if (result.success) revalidateAll();
  return result;
}

export async function deleteStaffComment(id: number): Promise<ActionResult> {
  const actor = await requireStaff();
  const result = await deleteCommentCommand(actor, id);
  if (result.success) revalidateAll();
  return result;
}
