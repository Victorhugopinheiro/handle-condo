import Link from "next/link";
import { Suspense } from "react";
import { ListPagination, buildPageHref } from "@/components/list-pagination";
import { OccurrenceCards } from "@/components/occurrence-cards";
import { OccurrenceEmpty } from "@/components/occurrence-empty";
import { OccurrenceFilters } from "@/components/occurrence-filters";
import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/data/categories";
import { listOccurrences } from "@/lib/data/occurrences";
import { parseOccurrenceFilters } from "@/lib/occurrences/parse-filters";
import { requireResident } from "@/lib/session";

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
  await requireResident();
  const params = await searchParams;
  console.log("params", params);
  const filters = parseOccurrenceFilters(params);
  const categories = await listCategories();
  const list = await listOccurrences(filters);
  const query = {
    q: filters.q,
    status: filters.status,
    categoria: filters.categoryId ? String(filters.categoryId) : undefined,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Ocorrências
        </h1>
        <Button asChild size="lg">
          <Link href="/ocorrencias/nova">Nova ocorrência</Link>
        </Button>
      </div>
      <OccurrenceFilters
        basePath="/ocorrencias"
        categories={categories}
        q={filters.q}
        status={filters.status}
        categoria={query.categoria}
      />
      {list.items.length === 0 ? (
        <OccurrenceEmpty newHref="/ocorrencias/nova" />
      ) : (
        <>
          <OccurrenceCards
            items={list.items}
            detailHref={(code) => `/ocorrencias/${code}`}
          />
          <ListPagination
            page={list.page}
            total={list.total}
            pageSize={list.pageSize}
            hrefFor={(page) => buildPageHref("/ocorrencias", query, page)}
          />
        </>
      )}
    </div>
  );
}
