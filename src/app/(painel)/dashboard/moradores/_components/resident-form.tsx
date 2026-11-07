"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  residentFormSchema,
  type ResidentFormValues,
} from "@/lib/occurrences/schema";
import type { ActionResult } from "@/lib/types";

export function ResidentForm({
  defaultValues,
  action,
}: {
  defaultValues?: ResidentFormValues;
  action: (values: ResidentFormValues) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      email: "",
      unit: "",
      phone: "",
    },
  });

  return (
    <form
      className="flex max-w-xl flex-col gap-6"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await action(values);
          if (!result.success) {
            if (result.errors) {
              Object.entries(result.errors).forEach(([key, messages]) => {
                form.setError(key as keyof ResidentFormValues, {
                  message: messages?.[0],
                });
              });
            }
            toast.error(result.message ?? "Não foi possível salvar.");
            return;
          }
          toast.success(result.message);
          router.push("/dashboard/moradores");
          router.refresh();
        });
      })}
    >
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.name) || undefined}>
          <FieldLabel htmlFor="name">Nome completo</FieldLabel>
          <Input
            id="name"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name")}
          />
          <FieldError>{form.formState.errors.name?.message}</FieldError>
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.email) || undefined}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.unit) || undefined}>
          <FieldLabel htmlFor="unit">Torre / apartamento</FieldLabel>
          <Input
            id="unit"
            aria-invalid={Boolean(form.formState.errors.unit)}
            {...form.register("unit")}
          />
          <FieldError>{form.formState.errors.unit?.message}</FieldError>
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.phone) || undefined}>
          <FieldLabel htmlFor="phone">Telefone</FieldLabel>
          <Input
            id="phone"
            aria-invalid={Boolean(form.formState.errors.phone)}
            {...form.register("phone")}
          />
          <FieldError>{form.formState.errors.phone?.message}</FieldError>
        </Field>
      </FieldGroup>
      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/dashboard/moradores")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
