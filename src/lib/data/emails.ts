import { getResidentByEmail, getStaffByEmail } from "@/lib/data/residents";

export async function isEmailTaken(
  email: string,
  options?: { ignoreResidentId?: number }
) {
  const staff = await getStaffByEmail(email);
  if (staff) {
    return true;
  }

  const resident = await getResidentByEmail(email);
  if (!resident) {
    return false;
  }

  if (options?.ignoreResidentId && resident.id === options.ignoreResidentId) {
    return false;
  }

  return true;
}
