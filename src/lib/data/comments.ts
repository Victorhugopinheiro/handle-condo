import { asDateRequired, dataClient, raise } from "@/lib/supabase/data";

export async function createComment(input: {
  occurrenceId: number;
  body: string;
  authorStaffId?: string;
  authorResidentId?: number;
}) {
  const { data, error } = await dataClient()
    .from("occurrence_comments")
    .insert({
      occurrence_id: input.occurrenceId,
      body: input.body,
      author_staff_id: input.authorStaffId ?? null,
      author_resident_id: input.authorResidentId ?? null,
    })
    .select(
      "id, occurrence_id, body, author_staff_id, author_resident_id, is_edited, created_at, updated_at"
    )
    .single();
  raise(error);
  if (!data) {
    throw new Error("Nenhum registro retornado.");
  }
  return {
    id: Number(data.id),
    occurrenceId: Number(data.occurrence_id),
    body: data.body as string,
    authorStaffId: (data.author_staff_id as string | null) ?? null,
    authorResidentId: data.author_resident_id
      ? Number(data.author_resident_id)
      : null,
    isEdited: Boolean(data.is_edited),
    createdAt: asDateRequired(data.created_at as string),
    updatedAt: asDateRequired(data.updated_at as string),
  };
}

export async function getCommentById(id: number) {
  const { data, error } = await dataClient()
    .from("occurrence_comments")
    .select(
      "id, occurrence_id, body, author_staff_id, author_resident_id, is_edited, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();
  raise(error);
  if (!data) {
    return null;
  }
  return {
    id: Number(data.id),
    occurrenceId: Number(data.occurrence_id),
    body: data.body as string,
    authorStaffId: (data.author_staff_id as string | null) ?? null,
    authorResidentId: data.author_resident_id
      ? Number(data.author_resident_id)
      : null,
    isEdited: Boolean(data.is_edited),
    createdAt: asDateRequired(data.created_at as string),
    updatedAt: asDateRequired(data.updated_at as string),
  };
}

export async function updateComment(id: number, body: string) {
  const { data, error } = await dataClient()
    .from("occurrence_comments")
    .update({
      body,
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  raise(error);
  return data ? { id: Number(data.id) } : null;
}

export async function deleteComment(id: number) {
  const { error } = await dataClient()
    .from("occurrence_comments")
    .delete()
    .eq("id", id);
  raise(error);
}
