import { createServiceSupabase } from "@/lib/supabase/admin";

export function dataClient() {
  return createServiceSupabase();
}

export function raise(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export function requiredRow<T>(data: T | null | undefined): T {
  if (data == null) {
    throw new Error("Nenhum registro retornado.");
  }
  return data;
}

export function asDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }
  return value instanceof Date ? value : new Date(value);
}

export function asDateRequired(value: string | Date | null | undefined) {
  return asDate(value) ?? new Date(0);
}
