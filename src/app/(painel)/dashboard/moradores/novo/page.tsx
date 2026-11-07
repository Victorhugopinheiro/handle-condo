import { Suspense } from "react";
import { ResidentForm } from "../_components/resident-form";
import { createResidentAction } from "../_actions/save-resident";
import { requireStaff } from "@/lib/session";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <NewResidentContent />
    </Suspense>
  );
}

async function NewResidentContent() {
  await requireStaff();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Novo morador
      </h1>
      <ResidentForm action={createResidentAction} />
    </div>
  );
}
