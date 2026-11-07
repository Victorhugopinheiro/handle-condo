import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OccurrenceStatus } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export function OccurrenceTable({
  items,
  detailHref,
}: {
  items: Array<{
    code: string;
    title: string;
    categoryName: string;
    locationValue: string;
    openedAt: Date;
    status: OccurrenceStatus;
  }>;
  detailHref: (code: string) => string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Categoria / título</TableHead>
            <TableHead>Local</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.code}>
              <TableCell className="font-medium">{item.code}</TableCell>
              <TableCell>
                <p className="text-muted-foreground">{item.categoryName}</p>
                <p>{item.title}</p>
              </TableCell>
              <TableCell>{item.locationValue}</TableCell>
              <TableCell>{formatDateTime(item.openedAt)}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="outline" size="sm">
                  <Link href={detailHref(item.code)}>Ver</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
