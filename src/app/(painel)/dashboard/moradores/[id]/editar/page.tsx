import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResidentForm } from "../../_components/resident-form";
import { updateResidentAction } from "../../_actions/save-resident";
import { getResidentById } from "@/lib/data/residents";
import { requireStaff } from "@/lib/session";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6">Carregando morador...</p>}>
      <EditResidentContent params={params} />
    </Suspense>
  );
}

async function EditResidentContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const residentId = Number(id);
  const resident = Number.isFinite(residentId)
    ? await getResidentById(residentId)
    : null;
  if (!resident) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Editar morador
      </h1>
      <ResidentForm
        defaultValues={{
          name: resident.name,
          email: resident.email,
          unit: resident.unit,
          phone: resident.phone,
        }}
        action={updateResidentAction.bind(null, resident.id)}
      />
    </div>
  );
}
