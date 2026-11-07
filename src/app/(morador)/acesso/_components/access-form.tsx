"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { residentAccessAction } from "../_actions/access";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/lib/constants";
import { residentAccessSchema } from "@/lib/occurrences/schema";

type Values = z.infer<typeof residentAccessSchema>;

export function AccessForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<Values>({
    resolver: zodResolver(residentAccessSchema),
    defaultValues: { email: "" },
  });

  return (
    <Card className="w-full max-w-md shadow-[0px_2px_4px_rgba(0,0,0,0.05)]">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">{APP_NAME}</CardTitle>
        <CardDescription>
          Área do morador — informe o e-mail cadastrado pela administração.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-6"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await residentAccessAction(values);
              if (!result.success) {
                toast.error(result.message ?? "Não foi possível entrar.");
              }
            });
          })}
        >
          <FieldGroup>
            <Field
              data-invalid={Boolean(form.formState.errors.email) || undefined}
            >
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>
          </FieldGroup>
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Verificando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
