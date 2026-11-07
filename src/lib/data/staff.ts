import { dataClient, raise } from "@/lib/supabase/data";

export type StaffRow = {
  id: string;
  name: string;
  email: string;
  role: "sindico" | "zelador";
  createdAt: Date;
};

function mapStaff(row: {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}): StaffRow {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role === "zelador" ? "zelador" : "sindico",
    createdAt: new Date(row.created_at),
  };
}

function displayName(email: string, metadataName?: string | null) {
  const fromMeta = metadataName?.trim();
  if (fromMeta) {
    return fromMeta;
  }
  const local = email.split("@")[0]?.replace(/[._]+/g, " ").trim();
  return local || "Funcionário";
}

export async function getStaffById(id: string) {
  const { data, error } = await dataClient()
    .from("staff_profiles")
    .select("id, name, email, role, created_at")
    .eq("id", id)
    .maybeSingle();
  raise(error);
  return data ? mapStaff(data) : null;
}

export async function getStaffByEmail(email: string) {
  const { data, error } = await dataClient()
    .from("staff_profiles")
    .select("id, name, email, role, created_at")
    .ilike("email", email.trim())
    .maybeSingle();
  raise(error);
  return data ? mapStaff(data) : null;
}

export async function ensureStaffProfile(input: {
  id: string;
  email: string;
  name?: string | null;
}) {
  const existing = await getStaffById(input.id);
  if (existing) {
    return existing;
  }

  const { data, error } = await dataClient()
    .from("staff_profiles")
    .insert({
      id: input.id,
      email: input.email.trim(),
      name: displayName(input.email, input.name),
      role: "sindico",
    })
    .select("id, name, email, role, created_at")
    .maybeSingle();

  if (error?.code === "23505") {
    return getStaffById(input.id);
  }
  raise(error);
  return data ? mapStaff(data) : getStaffById(input.id);
}
