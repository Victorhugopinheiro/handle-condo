import { Suspense } from "react";
import { connection } from "next/server";
import { StaffShell } from "@/components/staff-shell";
import { requireStaff } from "@/lib/session";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}

async function DashboardShell({ children }: { children: React.ReactNode }) {
  await connection();
  const staff = await requireStaff();
  return <StaffShell staff={staff}>{children}</StaffShell>;
}
