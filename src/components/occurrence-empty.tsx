import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export function OccurrenceEmpty({ newHref }: { newHref: string }) {
  return (
    <Empty className="border bg-card">
      <EmptyHeader>
        <EmptyTitle>Nenhuma ocorrência encontrada</EmptyTitle>
        <EmptyDescription>
          Ajuste a busca e os filtros ou abra um novo registro.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href={newHref}>Nova ocorrência</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
