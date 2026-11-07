export const CONDO_NAME = "Residencial Horizonte";
export const APP_NAME = "CondoManager";

export const COMMON_AREAS = [
  "Hall",
  "Garagem",
  "Piscina",
  "Salão de festas",
  "Playground",
  "Elevador",
  "Jardim",
  "Portaria",
] as const;

export type CommonArea = (typeof COMMON_AREAS)[number];

export const OCCURRENCE_STATUSES = [
  "pending",
  "in_review",
  "resolved",
  "cancelled",
] as const;

export type OccurrenceStatus = (typeof OCCURRENCE_STATUSES)[number];

export const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  pending: "Pendente",
  in_review: "Em análise",
  resolved: "Resolvido",
  cancelled: "Cancelado",
};

export const STAFF_ROLE_LABELS: Record<"sindico" | "zelador", string> = {
  sindico: "Síndico",
  zelador: "Zelador",
};

export const PAGE_SIZE = 10;
export const MAX_PHOTOS = 5;
export const PHOTO_BUCKET = "occurrence-photos";

export const RESIDENT_COOKIE = "cm_resident";
export const RESIDENT_SESSION_MAX_AGE = 60 * 60 * 24 * 7;
