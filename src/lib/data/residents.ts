import { dataClient, raise, requiredRow } from "@/lib/supabase/data";

export type ResidentRow = {
  id: number;
  name: string;
  email: string;
  unit: string;
  phone: string;
  createdAt: Date;
};

function mapResident(row: {
  id: number;
  name: string;
  email: string;
  unit: string;
  phone: string;
  created_at: string;
}): ResidentRow {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    unit: row.unit,
    phone: row.phone,
    createdAt: new Date(row.created_at),
  };
}

export async function listResidents() {
  const { data, error } = await dataClient()
    .from("residents")
    .select("id, name, email, unit, phone, created_at")
    .order("created_at", { ascending: false });
  raise(error);
  return (data ?? []).map(mapResident);
}

export async function getResidentById(id: number) {
  const { data, error } = await dataClient()
    .from("residents")
    .select("id, name, email, unit, phone, created_at")
    .eq("id", id)
    .maybeSingle();
  raise(error);
  return data ? mapResident(data) : null;
}

export async function getResidentByEmail(email: string) {
  const { data, error } = await dataClient()
    .from("residents")
    .select("id, name, email, unit, phone, created_at")
    .ilike("email", email.trim())
    .maybeSingle();
  raise(error);
  return data ? mapResident(data) : null;
}

export { getStaffByEmail } from "@/lib/data/staff";

export async function createResident(input: {
  name: string;
  email: string;
  unit: string;
  phone: string;
}) {
  const { data, error } = await dataClient()
    .from("residents")
    .insert({
      name: input.name,
      email: input.email.trim(),
      unit: input.unit,
      phone: input.phone,
    })
    .select("id, name, email, unit, phone, created_at")
    .single();
  raise(error);
  return mapResident(requiredRow(data));
}

export async function updateResident(
  id: number,
  input: { name: string; email: string; unit: string; phone: string }
) {
  const { data, error } = await dataClient()
    .from("residents")
    .update({
      name: input.name,
      email: input.email.trim(),
      unit: input.unit,
      phone: input.phone,
    })
    .eq("id", id)
    .select("id, name, email, unit, phone, created_at")
    .maybeSingle();
  raise(error);
  return data ? mapResident(data) : null;
}
