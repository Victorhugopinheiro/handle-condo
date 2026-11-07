import { PHOTO_BUCKET } from "@/lib/constants";
import { createServiceSupabase } from "@/lib/supabase/admin";
import { dataClient, raise } from "@/lib/supabase/data";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isImageFile(file: File) {
  return IMAGE_TYPES.has(file.type) || file.type.startsWith("image/");
}

export async function uploadOccurrencePhotos(
  occurrenceId: number,
  files: File[],
  startOrder = 0
) {
  const supabase = createServiceSupabase();
  const failed: string[] = [];
  let order = startOrder;

  for (const file of files) {
    if (!isImageFile(file)) {
      failed.push(file.name || "arquivo");
      continue;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${occurrenceId}/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      failed.push(file.name || "arquivo");
      continue;
    }

    const insert = await dataClient().from("occurrence_photos").insert({
      occurrence_id: occurrenceId,
      storage_path: path,
      sort_order: order,
    });
    if (insert.error) {
      failed.push(file.name || "arquivo");
      continue;
    }
    order += 1;
  }

  return failed;
}

export async function deletePhotosByIds(occurrenceId: number, ids: number[]) {
  if (!ids.length) {
    return;
  }

  const { data, error } = await dataClient()
    .from("occurrence_photos")
    .select("id, storage_path")
    .eq("occurrence_id", occurrenceId)
    .in("id", ids);
  raise(error);
  const rows = data ?? [];
  if (!rows.length) {
    return;
  }

  const supabase = createServiceSupabase();
  await supabase.storage
    .from(PHOTO_BUCKET)
    .remove(rows.map((row) => row.storage_path as string));
  const del = await dataClient()
    .from("occurrence_photos")
    .delete()
    .eq("occurrence_id", occurrenceId)
    .in("id", ids);
  raise(del.error);
}

export async function deleteAllOccurrencePhotos(occurrenceId: number) {
  const { data, error } = await dataClient()
    .from("occurrence_photos")
    .select("storage_path")
    .eq("occurrence_id", occurrenceId);
  raise(error);
  const rows = data ?? [];
  if (rows.length) {
    const supabase = createServiceSupabase();
    await supabase.storage
      .from(PHOTO_BUCKET)
      .remove(rows.map((row) => row.storage_path as string));
  }
}

export async function signedPhotoUrls(paths: string[]) {
  if (!paths.length) {
    return {} as Record<string, string>;
  }
  const supabase = createServiceSupabase();
  const { data } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(paths, 60 * 60);
  const map: Record<string, string> = {};
  data?.forEach((item) => {
    if (item.path && item.signedUrl) {
      map[item.path] = item.signedUrl;
    }
  });
  return map;
}
