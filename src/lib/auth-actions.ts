"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RESIDENT_COOKIE } from "@/lib/constants";
import { createServerSupabase } from "@/lib/supabase/server";

export async function logoutStaffAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function logoutResidentAction() {
  const cookieStore = await cookies();
  cookieStore.delete(RESIDENT_COOKIE);
  redirect("/acesso");
}
