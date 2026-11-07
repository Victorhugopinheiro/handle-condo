import Link from "next/link";
import { Suspense } from "react";
import { getResidents } from "./_data-access/get-residents";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Carregando moradores...</p>}>
      <ResidentsContent />
    </Suspense>
  );
}

async function ResidentsContent() {
  const residents = await getResidents();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Cadastro de Moradores
          </h1>
          <p className="text-muted-foreground">
            Nome, e-mail, unidade e telefone. Sem exclusão no V1.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/moradores/novo">Cadastrar morador</Link>
        </Button>
      </div>

      {residents.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>Nenhum morador cadastrado</EmptyTitle>
            <EmptyDescription>
              Cadastre o primeiro morador para liberar o acesso só-e-mail.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/dashboard/moradores/novo">Cadastrar morador</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell>{resident.name}</TableCell>
                  <TableCell>{resident.email}</TableCell>
                  <TableCell>{resident.unit}</TableCell>
                  <TableCell>{resident.phone}</TableCell>
                  <TableCell>{formatDate(resident.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/moradores/${resident.id}/editar`}>
                        Editar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
