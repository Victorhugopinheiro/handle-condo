import Link from "next/link";
import { Suspense } from "react";
import { KpiCards } from "@/components/kpi-cards";
import { ListPagination, buildPageHref } from "@/components/list-pagination";
import { OccurrenceEmpty } from "@/components/occurrence-empty";
import { OccurrenceFilters } from "@/components/occurrence-filters";
import { OccurrenceTable } from "@/components/occurrence-table";
import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/data/categories";
import { getOccurrenceKpis, listOccurrences } from "@/lib/data/occurrences";
import { parseOccurrenceFilters } from "@/lib/occurrences/parse-filters";
import { requireStaff } from "@/lib/session";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<p className="p-6">Carregando ocorrências...</p>}>
      <OccurrencesContent searchParams={searchParams} />
    </Suspense>
  );
}

async function OccurrencesContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireStaff();
  const params = await searchParams;
  const filters = parseOccurrenceFilters(params);
  const categories = await listCategories();

  let kpis: { total: number; open: number; resolvedThisMonth: number } | null =
    null;
  let kpiError: string | undefined;
  try {
    kpis = await getOccurrenceKpis();
  } catch {
    kpiError = "Não foi possível carregar os indicadores.";
  }

  const list = await listOccurrences(filters);
  const query = {
    q: filters.q,
    status: filters.status,
    categoria: filters.categoryId ? String(filters.categoryId) : undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Gestão de Ocorrências
          </h1>
          <p className="text-muted-foreground">
            Acompanhe, filtre e abra chamados do condomínio.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/ocorrencias/nova">Nova ocorrência</Link>
        </Button>
      </div>

      <KpiCards
        total={kpis?.total ?? 0}
        open={kpis?.open ?? 0}
        resolvedThisMonth={kpis?.resolvedThisMonth ?? 0}
        error={kpiError}
      />

      <OccurrenceFilters
        basePath="/dashboard/ocorrencias"
        categories={categories}
        q={filters.q}
        status={filters.status}
        categoria={query.categoria}
      />

      {list.items.length === 0 ? (
        <OccurrenceEmpty newHref="/dashboard/ocorrencias/nova" />
      ) : (
        <>
          <OccurrenceTable
            items={list.items}
            detailHref={(code) => `/dashboard/ocorrencias/${code}`}
          />
          <ListPagination
            page={list.page}
            total={list.total}
            pageSize={list.pageSize}
            hrefFor={(page) =>
              buildPageHref("/dashboard/ocorrencias", query, page)
            }
          />
        </>
      )}
    </div>
  );
}
