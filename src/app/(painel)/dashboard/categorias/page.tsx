import { Suspense } from "react";
import { CategoryForm } from "./_components/category-form";
import { listCategories } from "@/lib/data/categories";
import { requireStaff } from "@/lib/session";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Carregando categorias...</p>}>
      <CategoriesContent />
    </Suspense>
  );
}

async function CategoriesContent() {
  await requireStaff();
  const categories = await listCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Categorias
        </h1>
        <p className="text-muted-foreground">
          Usadas ao abrir e filtrar ocorrências. Apenas criar e listar.
        </p>
      </div>
      <CategoryForm />
      {categories.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Nenhuma categoria</EmptyTitle>
            <EmptyDescription>
              Cadastre a primeira categoria para abrir ocorrências.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="rounded-lg border bg-card px-4 py-3"
            >
              {category.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
