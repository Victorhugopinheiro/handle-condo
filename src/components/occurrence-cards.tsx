import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { OccurrenceStatus } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export function OccurrenceCards({
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
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <Link key={item.code} href={detailHref(item.code)}>
          <Card className="shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardDescription>
                  {item.code} · {item.categoryName}
                </CardDescription>
                <CardTitle>{item.title}</CardTitle>
              </div>
              <StatusBadge status={item.status} />
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.locationValue} · {formatDateTime(item.openedAt)}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
