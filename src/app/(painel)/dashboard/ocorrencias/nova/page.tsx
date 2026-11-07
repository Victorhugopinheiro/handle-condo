import { Suspense } from "react";
import { OccurrenceForm } from "@/components/occurrence-form";
import { listCategories } from "@/lib/data/categories";
import { requireStaff } from "@/lib/session";
import { createStaffOccurrence } from "../_actions/occurrence-actions";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <NewOccurrenceContent />
    </Suspense>
  );
}

async function NewOccurrenceContent() {
  await requireStaff();
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Nova ocorrência
      </h1>
      <OccurrenceForm
        categories={categories}
        submitLabel="Abrir ocorrência"
        listHref="/dashboard/ocorrencias"
        action={createStaffOccurrence}
      />
    </div>
  );
}
