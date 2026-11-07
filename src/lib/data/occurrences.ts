import { PAGE_SIZE, type OccurrenceStatus } from "@/lib/constants";
import {
  asDate,
  asDateRequired,
  dataClient,
  raise,
  requiredRow,
} from "@/lib/supabase/data";

export type OccurrenceFilters = {
  q?: string;
  status?: OccurrenceStatus;
  categoryId?: number;
  page?: number;
};

type OccurrenceRow = {
  id: number;
  code: string;
  title: string;
  description: string;
  category_id: number;
  location_kind: "common" | "custom";
  location_value: string;
  author_staff_id: string | null;
  author_resident_id: number | null;
  status: OccurrenceStatus;
  opened_at: string;
  closed_at: string | null;
  updated_at: string;
  occurrence_categories?: { name: string } | { name: string }[] | null;
  staff_profiles?: { name: string } | { name: string }[] | null;
  residents?:
    { name: string; unit: string } | { name: string; unit: string }[] | null;
};

function embedOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function sanitizeSearch(value: string) {
  return value.replace(/[%_,()]/g, " ").trim();
}

export async function listOccurrences(filters: OccurrenceFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = dataClient()
    .from("occurrences")
    .select(
      "id, code, title, description, status, location_kind, location_value, opened_at, closed_at, category_id, author_staff_id, author_resident_id, occurrence_categories!category_id(name)",
      { count: "exact" }
    )
    .order("opened_at", { ascending: false })
    .range(from, to);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  const q = filters.q ? sanitizeSearch(filters.q) : "";
  if (q) {
    query = query.or(
      `code.ilike.%${q}%,title.ilike.%${q}%,description.ilike.%${q}%,location_value.ilike.%${q}%`
    );
  }

  const { data, error, count } = await query;
  raise(error);

  const items = ((data ?? []) as OccurrenceRow[]).map((row) => ({
    id: Number(row.id),
    code: row.code,
    title: row.title,
    description: row.description,
    status: row.status,
    locationKind: row.location_kind,
    locationValue: row.location_value,
    openedAt: asDateRequired(row.opened_at),
    closedAt: asDate(row.closed_at),
    categoryId: Number(row.category_id),
    categoryName: embedOne(row.occurrence_categories)?.name ?? "",
    authorStaffId: row.author_staff_id,
    authorResidentId: row.author_resident_id
      ? Number(row.author_resident_id)
      : null,
  }));

  return {
    items,
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

export async function getOccurrenceByCode(code: string) {
  const { data, error } = await dataClient()
    .from("occurrences")
    .select(
      "id, code, title, description, status, location_kind, location_value, opened_at, closed_at, updated_at, category_id, author_staff_id, author_resident_id, occurrence_categories!category_id(name), staff_profiles!author_staff_id(name), residents!author_resident_id(name, unit)"
    )
    .eq("code", code.toUpperCase())
    .maybeSingle();
  raise(error);
  if (!data) {
    return null;
  }
  const row = data as OccurrenceRow;
  const category = embedOne(row.occurrence_categories);
  const staff = embedOne(row.staff_profiles);
  const resident = embedOne(row.residents);
  return {
    id: Number(row.id),
    code: row.code,
    title: row.title,
    description: row.description,
    status: row.status,
    locationKind: row.location_kind,
    locationValue: row.location_value,
    openedAt: asDateRequired(row.opened_at),
    closedAt: asDate(row.closed_at),
    updatedAt: asDateRequired(row.updated_at),
    categoryId: Number(row.category_id),
    categoryName: category?.name ?? "",
    authorStaffId: row.author_staff_id,
    authorResidentId: row.author_resident_id
      ? Number(row.author_resident_id)
      : null,
    authorStaffName: staff?.name ?? null,
    authorResidentName: resident?.name ?? null,
    authorResidentUnit: resident?.unit ?? null,
  };
}

export async function getOccurrencePhotos(occurrenceId: number) {
  const { data, error } = await dataClient()
    .from("occurrence_photos")
    .select("id, occurrence_id, storage_path, sort_order, created_at")
    .eq("occurrence_id", occurrenceId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  raise(error);
  return (data ?? []).map((row) => ({
    id: Number(row.id),
    occurrenceId: Number(row.occurrence_id),
    storagePath: row.storage_path as string,
    sortOrder: Number(row.sort_order),
    createdAt: asDateRequired(row.created_at as string),
  }));
}

export async function getOccurrenceComments(occurrenceId: number) {
  const { data, error } = await dataClient()
    .from("occurrence_comments")
    .select(
      "id, body, is_edited, created_at, updated_at, author_staff_id, author_resident_id, staff_profiles!author_staff_id(name), residents!author_resident_id(name)"
    )
    .eq("occurrence_id", occurrenceId)
    .order("created_at", { ascending: true });
  raise(error);

  return (data ?? []).map((row) => {
    const staff = embedOne(
      row.staff_profiles as { name: string } | { name: string }[] | null
    );
    const resident = embedOne(
      row.residents as { name: string } | { name: string }[] | null
    );
    return {
      id: Number(row.id),
      body: row.body as string,
      isEdited: Boolean(row.is_edited),
      createdAt: asDateRequired(row.created_at as string),
      updatedAt: asDateRequired(row.updated_at as string),
      authorStaffId: (row.author_staff_id as string | null) ?? null,
      authorResidentId: row.author_resident_id
        ? Number(row.author_resident_id)
        : null,
      authorStaffName: staff?.name ?? null,
      authorResidentName: resident?.name ?? null,
    };
  });
}

export async function createOccurrenceRecord(input: {
  title: string;
  description: string;
  categoryId: number;
  locationKind: "common" | "custom";
  locationValue: string;
  authorStaffId?: string;
  authorResidentId?: number;
}) {
  const { data, error } = await dataClient()
    .from("occurrences")
    .insert({
      title: input.title,
      description: input.description,
      category_id: input.categoryId,
      location_kind: input.locationKind,
      location_value: input.locationValue,
      author_staff_id: input.authorStaffId ?? null,
      author_resident_id: input.authorResidentId ?? null,
      status: "pending",
    })
    .select("id, code")
    .single();
  raise(error);
  const row = requiredRow(data);
  return { id: Number(row.id), code: row.code as string };
}

export async function updateOccurrenceRecord(
  id: number,
  input: {
    title: string;
    description: string;
    categoryId: number;
    locationKind: "common" | "custom";
    locationValue: string;
  }
) {
  const { data, error } = await dataClient()
    .from("occurrences")
    .update({
      title: input.title,
      description: input.description,
      category_id: input.categoryId,
      location_kind: input.locationKind,
      location_value: input.locationValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  raise(error);
  return data ? { id: Number(data.id) } : null;
}

export async function updateOccurrenceStatus(
  id: number,
  status: OccurrenceStatus
) {
  const closedAt =
    status === "resolved" || status === "cancelled"
      ? new Date().toISOString()
      : null;
  const { data, error } = await dataClient()
    .from("occurrences")
    .update({
      status,
      closed_at: closedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  raise(error);
  return data ? { id: Number(data.id) } : null;
}

export async function deleteOccurrenceRecord(id: number) {
  const { error } = await dataClient()
    .from("occurrences")
    .delete()
    .eq("id", id);
  raise(error);
}

export async function getOccurrenceStatusById(id: number) {
  const { data, error } = await dataClient()
    .from("occurrences")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  raise(error);
  return (data?.status as OccurrenceStatus | undefined) ?? null;
}

export async function getOccurrenceKpis() {
  const client = dataClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const total = await client
    .from("occurrences")
    .select("id", { count: "exact", head: true });
  raise(total.error);

  const open = await client
    .from("occurrences")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending", "in_review"]);
  raise(open.error);

  const resolved = await client
    .from("occurrences")
    .select("id", { count: "exact", head: true })
    .eq("status", "resolved")
    .gte("closed_at", monthStart.toISOString());
  raise(resolved.error);

  return {
    total: total.count ?? 0,
    open: open.count ?? 0,
    resolvedThisMonth: resolved.count ?? 0,
  };
}
