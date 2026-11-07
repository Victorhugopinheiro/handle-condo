import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getResidentById } from "@/lib/data/residents";
import { getStaffById } from "@/lib/data/staff";
import { RESIDENT_COOKIE } from "@/lib/constants";
import { verifyResidentToken } from "@/lib/resident-token";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ResidentActor, StaffActor } from "@/lib/types";

export async function getStaffSession(): Promise<StaffActor | null> {
  await connection();
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (typeof sub !== "string") {
    return null;
  }

  const staff = await getStaffById(sub);
  if (!staff) {
    return null;
  }

  return {
    kind: "staff",
    id: staff.id,
    name: staff.name,
    email: staff.email,
    role: staff.role,
  };
}

export async function getResidentSession(): Promise<ResidentActor | null> {
  await connection();
  const cookieStore = await cookies();
  const token = cookieStore.get(RESIDENT_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifyResidentToken(token);
  if (!payload) {
    return null;
  }

  const resident = await getResidentById(payload.residentId);
  if (!resident) {
    return null;
  }

  return {
    kind: "resident",
    id: resident.id,
    name: resident.name,
    email: resident.email,
    unit: resident.unit,
  };
}

export async function requireStaff(): Promise<StaffActor> {
  const staff = await getStaffSession();
  if (!staff) {
    redirect("/login");
  }
  return staff;
}

export async function requireResident(): Promise<ResidentActor> {
  const resident = await getResidentSession();
  if (!resident) {
    redirect("/acesso");
  }
  return resident;
}

export async function requireStaffOrRedirectHome() {
  const staff = await getStaffSession();
  if (staff) {
    redirect("/dashboard/ocorrencias");
  }
}

export async function requireResidentOrRedirectHome() {
  const resident = await getResidentSession();
  if (resident) {
    redirect("/ocorrencias");
  }
}
