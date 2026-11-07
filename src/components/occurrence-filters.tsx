"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OCCURRENCE_STATUSES, STATUS_LABELS } from "@/lib/constants";

export function OccurrenceFilters({
  basePath,
  categories,
  q = "",
  status = "",
  categoria = "",
}: {
  basePath: string;
  categories: { id: number; name: string }[];
  q?: string;
  status?: string;
  categoria?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const [statusValue, setStatusValue] = useState(status || "all");
  const [categoryValue, setCategoryValue] = useState(categoria || "all");

  function handleFilter() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (statusValue !== "all") params.set("status", statusValue);
    if (categoryValue !== "all") params.set("categoria", categoryValue);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <form
      className="rounded-xl border bg-card p-4 shadow-[0px_2px_4px_rgba(0,0,0,0.05)]"
      onSubmit={(event) => {
        event.preventDefault();
        handleFilter();
      }}
    >
      <FieldGroup className="gap-4 md:grid md:grid-cols-4 md:items-end">
        <Field>
          <FieldLabel htmlFor="q">Busca</FieldLabel>
          <Input
            id="q"
            placeholder="ID, local ou descrição"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select value={statusValue} onValueChange={setStatusValue}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos</SelectItem>
                {OCCURRENCE_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Categoria</FieldLabel>
          <Select value={categoryValue} onValueChange={setCategoryValue}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Button type="submit" size="lg">
          Filtrar
        </Button>
      </FieldGroup>
    </form>
  );
}
