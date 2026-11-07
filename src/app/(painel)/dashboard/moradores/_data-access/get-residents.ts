import { listResidents } from "@/lib/data/residents";
import { requireStaff } from "@/lib/session";

export async function getResidents() {
  await requireStaff();
  return listResidents();
}
