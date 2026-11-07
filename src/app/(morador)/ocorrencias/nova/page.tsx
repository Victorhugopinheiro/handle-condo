import { Suspense } from "react";
import { OccurrenceForm } from "@/components/occurrence-form";
import { listCategories } from "@/lib/data/categories";
import { requireResident } from "@/lib/session";
import { createResidentOccurrence } from "../_actions/occurrence-actions";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Carregando...</p>}>
      <NewOccurrenceContent />
    </Suspense>
  );
}

async function NewOccurrenceContent() {
  await requireResident();
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Nova ocorrência
      </h1>
      <OccurrenceForm
        categories={categories}
        submitLabel="Abrir ocorrência"
        listHref="/ocorrencias"
        action={createResidentOccurrence}
      />
    </div>
  );
}
