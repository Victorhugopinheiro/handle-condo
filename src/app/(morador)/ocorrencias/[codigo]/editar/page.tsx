import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OccurrenceForm } from "@/components/occurrence-form";
import { listCategories } from "@/lib/data/categories";
import {
  getOccurrenceByCode,
  getOccurrencePhotos,
} from "@/lib/data/occurrences";
import { signedPhotoUrls } from "@/lib/data/photos";
import { canEditOccurrence } from "@/lib/permissions";
import { requireResident } from "@/lib/session";
import { updateResidentOccurrence } from "../../_actions/occurrence-actions";

export default function Page({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-6">Carregando ocorrência...</p>}>
      <EditOccurrenceContent params={params} />
    </Suspense>
  );
}

async function EditOccurrenceContent({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const resident = await requireResident();
  const { codigo } = await params;
  const occurrence = await getOccurrenceByCode(codigo);
  if (!occurrence || !canEditOccurrence(resident, occurrence)) {
    notFound();
  }

  const categories = await listCategories();
  const photos = await getOccurrencePhotos(occurrence.id);
  const urls = await signedPhotoUrls(photos.map((photo) => photo.storagePath));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Editar {occurrence.code}
      </h1>
      <OccurrenceForm
        categories={categories}
        submitLabel="Salvar alterações"
        listHref="/ocorrencias"
        defaultValues={{
          title: occurrence.title,
          description: occurrence.description,
          categoryId: occurrence.categoryId,
          locationKind: occurrence.locationKind,
          locationValue: occurrence.locationValue,
        }}
        existingPhotos={photos.map((photo) => ({
          id: photo.id,
          url: urls[photo.storagePath] ?? "",
        }))}
        action={(values, formData) =>
          updateResidentOccurrence(occurrence.code, values, formData)
        }
      />
    </div>
  );
}
