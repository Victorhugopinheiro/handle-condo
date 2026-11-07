import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OccurrenceDetailView } from "@/components/occurrence-detail";
import {
  getOccurrenceByCode,
  getOccurrenceComments,
  getOccurrencePhotos,
} from "@/lib/data/occurrences";
import { signedPhotoUrls } from "@/lib/data/photos";
import { requireStaff } from "@/lib/session";
import {
  addStaffComment,
  changeStaffStatus,
  deleteStaffComment,
  deleteStaffOccurrence,
  editStaffComment,
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
  const staff = await requireStaff();
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
      actor={staff}
      occurrence={occurrence}
      photos={photos.map((photo) => ({
        id: photo.id,
        url: urls[photo.storagePath] ?? "",
      }))}
      comments={comments}
      listHref="/dashboard/ocorrencias"
      editHref={`/dashboard/ocorrencias/${occurrence.code}/editar`}
      onChangeStatus={changeStaffStatus}
      onDelete={deleteStaffOccurrence}
      onAddComment={addStaffComment}
      onEditComment={editStaffComment}
      onDeleteComment={deleteStaffComment}
    />
  );
}
