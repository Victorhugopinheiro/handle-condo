import { Suspense } from "react";
import { connection } from "next/server";
import { AccessForm } from "./_components/access-form";
import { requireResidentOrRedirectHome } from "@/lib/session";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <AccessContent />
    </Suspense>
  );
}

async function AccessContent() {
  await connection();
  await requireResidentOrRedirectHome();

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <AccessForm />
    </div>
  );
}
