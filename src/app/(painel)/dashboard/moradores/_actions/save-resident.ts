"use server";

import { revalidatePath } from "next/cache";
import { isEmailTaken } from "@/lib/data/emails";
import { createResident, updateResident } from "@/lib/data/residents";
import { residentFormSchema } from "@/lib/occurrences/schema";
import { requireStaff } from "@/lib/session";
import type { ActionResult } from "@/lib/types";

export async function createResidentAction(
  input: unknown
): Promise<ActionResult> {
  await requireStaff();
  const parsed = residentFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  if (await isEmailTaken(parsed.data.email)) {
    return { success: false, message: "Este e-mail já está em uso." };
  }

  await createResident(parsed.data);
  revalidatePath("/dashboard/moradores");
  return { success: true, message: "Morador cadastrado." };
}

export async function updateResidentAction(
  id: number,
  input: unknown
): Promise<ActionResult> {
  await requireStaff();
  const parsed = residentFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  if (await isEmailTaken(parsed.data.email, { ignoreResidentId: id })) {
    return { success: false, message: "Este e-mail já está em uso." };
  }

  const updated = await updateResident(id, parsed.data);
  if (!updated) {
    return { success: false, message: "Morador não encontrado." };
  }

  revalidatePath("/dashboard/moradores");
  return { success: true, message: "Cadastro atualizado." };
}
