"use server";

import { revalidatePath } from "next/cache";
import { categoryNameExists, createCategory } from "@/lib/data/categories";
import { categoryFormSchema } from "@/lib/occurrences/schema";
import { requireStaff } from "@/lib/session";
import type { ActionResult } from "@/lib/types";

export async function createCategoryAction(
  input: unknown
): Promise<ActionResult> {
  await requireStaff();
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  if (await categoryNameExists(parsed.data.name)) {
    return {
      success: false,
      message: "Já existe uma categoria com esse nome.",
    };
  }

  try {
    await createCategory(parsed.data.name);
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message.toLowerCase() : "";
    if (detail.includes("duplicate") || detail.includes("unique")) {
      return {
        success: false,
        message: "Já existe uma categoria com esse nome.",
      };
    }
    return { success: false, message: "Não foi possível criar a categoria." };
  }

  revalidatePath("/dashboard/categorias");
  revalidatePath("/dashboard/ocorrencias");
  return { success: true, message: "Categoria criada." };
}
