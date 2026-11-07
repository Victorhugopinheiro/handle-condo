import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, type OccurrenceStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<OccurrenceStatus, string> = {
  pending: "border-transparent bg-red-100 text-red-900",
  in_review: "border-transparent bg-amber-100 text-amber-950",
  resolved: "border-transparent bg-emerald-100 text-emerald-900",
  cancelled: "border-transparent bg-slate-200 text-slate-800",
};

export function StatusBadge({ status }: { status: OccurrenceStatus }) {
  return (
    <Badge className={cn("rounded-full px-2.5", STATUS_CLASS[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
