"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { createCategoryAction } from "../_actions/create-category";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { categoryFormSchema } from "@/lib/occurrences/schema";

type Values = z.infer<typeof categoryFormSchema>;

export function CategoryForm() {
  const form = useForm<Values>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "" },
  });
  const { isSubmitting } = form.formState;

  async function handleCreate(values: Values) {
    const result = await createCategoryAction(values);
    if (!result.success) {
      if (result.errors) {
        Object.entries(result.errors).forEach(([key, messages]) => {
          form.setError(key as keyof Values, { message: messages?.[0] });
        });
      }
      toast.error(result.message ?? "Não foi possível salvar.");
      return;
    }

    toast.success(result.message);
    form.reset({ name: "" });
  }

  return (
    <form
      className="flex max-w-lg flex-col gap-4"
      onSubmit={form.handleSubmit(handleCreate)}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || undefined}>
              <FieldLabel htmlFor="category-name">Nova categoria</FieldLabel>
              <Input
                id="category-name"
                autoComplete="off"
                aria-invalid={fieldState.invalid || undefined}
                {...field}
              />
              <FieldError>{fieldState.error?.message}</FieldError>
            </Field>
          )}
        />
      </FieldGroup>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Adicionar"}
      </Button>
    </form>
  );
}
