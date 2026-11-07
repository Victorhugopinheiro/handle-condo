"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getResidentByEmail, getStaffByEmail } from "@/lib/data/residents";
import { residentAccessSchema } from "@/lib/occurrences/schema";
import { residentCookieOptions, signResidentToken } from "@/lib/resident-token";
import type { ActionResult } from "@/lib/types";

export async function residentAccessAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = residentAccessSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.trim();
  const staff = await getStaffByEmail(email);
  if (staff) {
    return { success: false, message: "E-mail não encontrado no cadastro." };
  }

  const resident = await getResidentByEmail(email);
  if (!resident) {
    return { success: false, message: "E-mail não encontrado no cadastro." };
  }

  const token = await signResidentToken({
    residentId: resident.id,
    email: resident.email,
  });
  const cookieStore = await cookies();
  const options = residentCookieOptions();
  cookieStore.set(options.name, token, options);
  redirect("/ocorrencias");
}
