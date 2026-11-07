import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function KpiCards({
  total,
  open,
  resolvedThisMonth,
  error,
}: {
  total: number;
  open: number;
  resolvedThisMonth: number;
  error?: string;
}) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Indicadores</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const items = [
    { label: "Total de ocorrências", value: total },
    { label: "Pendentes / Em análise", value: open },
    { label: "Resolvidas (mês)", value: resolvedThisMonth },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.label}
          className="shadow-[0px_2px_4px_rgba(0,0,0,0.05)]"
        >
          <CardHeader>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="font-heading text-3xl">
              {item.value}
            </CardTitle>
          </CardHeader>
          <CardContent />
        </Card>
      ))}
    </div>
  );
}
