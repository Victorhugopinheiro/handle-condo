import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OccurrenceDetailView } from "@/components/occurrence-detail";
import {
  getOccurrenceByCode,
  getOccurrenceComments,
  getOccurrencePhotos,
} from "@/lib/data/occurrences";
import { signedPhotoUrls } from "@/lib/data/photos";
import { requireResident } from "@/lib/session";
import {
  addResidentComment,
  deleteResidentComment,
  deleteResidentOccurrence,
  editResidentComment,
} from "../_actions/occurrence-actions";

export default function Page({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-6">Carregando ocorrência...</p>}>
      <OccurrenceDetailContent params={params} />
    </Suspense>
  );
}

async function OccurrenceDetailContent({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const resident = await requireResident();
  const { codigo } = await params;
  const occurrence = await getOccurrenceByCode(codigo);
  if (!occurrence) {
    notFound();
  }

  const photos = await getOccurrencePhotos(occurrence.id);
  const urls = await signedPhotoUrls(photos.map((photo) => photo.storagePath));
  const comments = await getOccurrenceComments(occurrence.id);

  return (
    <OccurrenceDetailView
      actor={resident}
      occurrence={occurrence}
      photos={photos.map((photo) => ({
        id: photo.id,
        url: urls[photo.storagePath] ?? "",
      }))}
      comments={comments}
      listHref="/ocorrencias"
      editHref={`/ocorrencias/${occurrence.code}/editar`}
      onDelete={deleteResidentOccurrence}
      onAddComment={addResidentComment}
      onEditComment={editResidentComment}
      onDeleteComment={deleteResidentComment}
    />
  );
}
