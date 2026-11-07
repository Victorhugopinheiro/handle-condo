export function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

export function authorLabel(occurrence: {
  authorStaffName: string | null;
  authorResidentName: string | null;
  authorResidentUnit: string | null;
}) {
  if (occurrence.authorStaffName) {
    return `${occurrence.authorStaffName} (funcionário)`;
  }
  if (occurrence.authorResidentName) {
    return occurrence.authorResidentUnit
      ? `${occurrence.authorResidentName} · ${occurrence.authorResidentUnit}`
      : occurrence.authorResidentName;
  }
  return "—";
}
