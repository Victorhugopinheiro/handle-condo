"use server";

import { redirect } from "next/navigation";
import { ensureStaffProfile } from "@/lib/data/staff";
import { getSupabaseConfigError } from "@/lib/env";
import { loginSchema } from "@/lib/occurrences/schema";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

function authErrorMessage(error: { message?: string; code?: string } | null) {
  const code = error?.code ?? "";
  const raw = (error?.message ?? "").toLowerCase();

  if (code === "email_not_confirmed" || raw.includes("email not confirmed")) {
    return "Confirme o e-mail no Supabase (Authentication → Users → Auto Confirm) e tente de novo.";
  }

  if (raw.includes("invalid api key") || raw.includes("jwt")) {
    return "Chave do Supabase inválida. Atualize NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local (Settings → API) e reinicie o `npm run dev`.";
  }

  if (raw.includes("failed to fetch") || raw.includes("fetch")) {
    return "Não foi possível falar com o Supabase. Confira NEXT_PUBLIC_SUPABASE_URL e a internet.";
  }

  if (raw.includes("invalid login") || raw.includes("invalid credentials")) {
    return "E-mail ou senha incorretos. Use exatamente o e-mail do Auth (ex.: victor@victor.com).";
  }

  return error?.message
    ? `Não foi possível entrar: ${error.message}`
    : "Não foi possível entrar. Verifique o e-mail e a senha e tente de novo.";
}

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const configError = getSupabaseConfigError();
  if (configError) {
    return { success: false, message: configError };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.trim(),
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      success: false,
      message: authErrorMessage(error),
    };
  }

  try {
    const staff = await ensureStaffProfile({
      id: data.user.id,
      email: data.user.email ?? parsed.data.email,
      name:
        typeof data.user.user_metadata?.name === "string"
          ? data.user.user_metadata.name
          : null,
    });

    if (!staff) {
      await supabase.auth.signOut();
      return {
        success: false,
        message:
          "O login no Auth funcionou, mas o perfil em staff_profiles não foi encontrado. Confira se a tabela existe no projeto.",
      };
    }
  } catch (cause) {
    await supabase.auth.signOut();
    const detail = cause instanceof Error ? cause.message : "erro desconhecido";
    return {
      success: false,
      message: `Auth ok, falha ao ler o banco (staff_profiles). ${detail}`,
    };
  }

  redirect("/dashboard/ocorrencias");
}
