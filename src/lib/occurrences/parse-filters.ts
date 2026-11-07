import { OCCURRENCE_STATUSES, type OccurrenceStatus } from "@/lib/constants";
import type { OccurrenceFilters } from "@/lib/data/occurrences";

export function parseOccurrenceFilters(searchParams: {
  q?: string | string[];
  status?: string | string[];
  categoria?: string | string[];
  page?: string | string[];
}): OccurrenceFilters {
  const first = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;
  const q = first(searchParams.q)?.trim() || undefined;
  const statusRaw = first(searchParams.status);
  const status = OCCURRENCE_STATUSES.includes(statusRaw as OccurrenceStatus)
    ? (statusRaw as OccurrenceStatus)
    : undefined;
  const categoryRaw = first(searchParams.categoria);
  const categoryId = categoryRaw ? Number(categoryRaw) : undefined;
  const page = Number(first(searchParams.page) ?? "1") || 1;

  return {
    q,
    status,
    categoryId: Number.isFinite(categoryId) ? categoryId : undefined,
    page,
  };
}
