import { Suspense } from "react";
import { connection } from "next/server";
import { ResidentShell } from "@/components/resident-shell";
import { requireResident } from "@/lib/session";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  await connection();
  const resident = await requireResident();
  return <ResidentShell resident={resident}>{children}</ResidentShell>;
}
