import { dataClient, raise, requiredRow } from "@/lib/supabase/data";

export type CategoryRow = {
  id: number;
  name: string;
  createdAt: Date;
};

function mapCategory(row: {
  id: number;
  name: string;
  created_at: string;
}): CategoryRow {
  return {
    id: Number(row.id),
    name: row.name,
    createdAt: new Date(row.created_at),
  };
}

export async function listCategories() {
  const { data, error } = await dataClient()
    .from("occurrence_categories")
    .select("id, name, created_at")
    .order("name", { ascending: true });
  raise(error);
  return (data ?? []).map(mapCategory);
}

export async function getCategoryById(id: number) {
  const { data, error } = await dataClient()
    .from("occurrence_categories")
    .select("id, name, created_at")
    .eq("id", id)
    .maybeSingle();
  raise(error);
  return data ? mapCategory(data) : null;
}

export async function createCategory(name: string) {
  const { data, error } = await dataClient()
    .from("occurrence_categories")
    .insert({ name })
    .select("id, name, created_at")
    .single();
  raise(error);
  return mapCategory(requiredRow(data));
}

export async function categoryNameExists(name: string) {
  const { data, error } = await dataClient()
    .from("occurrence_categories")
    .select("id")
    .ilike("name", name.trim())
    .maybeSingle();
  raise(error);
  return Boolean(data);
}
