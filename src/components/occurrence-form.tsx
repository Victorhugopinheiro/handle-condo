"use client";

import { useState, useTransition } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COMMON_AREAS, MAX_PHOTOS } from "@/lib/constants";
import {
  occurrenceFormSchema,
  type OccurrenceFormValues,
} from "@/lib/occurrences/schema";
import type { ActionResult } from "@/lib/types";

type PhotoPreview = { id: number; url: string };

export function OccurrenceForm({
  categories,
  defaultValues,
  existingPhotos = [],
  submitLabel,
  listHref,
  action,
}: {
  categories: { id: number; name: string }[];
  defaultValues?: Partial<OccurrenceFormValues>;
  existingPhotos?: PhotoPreview[];
  submitLabel: string;
  listHref: string;
  action: (
    input: OccurrenceFormValues,
    formData: FormData
  ) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [removeIds, setRemoveIds] = useState<number[]>([]);
  const visiblePhotos = existingPhotos.filter(
    (photo) => !removeIds.includes(photo.id)
  );

  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(occurrenceFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      categoryId: defaultValues?.categoryId ?? 0,
      locationKind: defaultValues?.locationKind ?? "common",
      locationValue: defaultValues?.locationValue ?? COMMON_AREAS[0],
    },
  });

  const locationKind = form.watch("locationKind");

  function handleSubmit(values: OccurrenceFormValues) {
    startTransition(async () => {
      const formEl = document.getElementById(
        "occurrence-form"
      ) as HTMLFormElement | null;
      const formData = new FormData(formEl ?? undefined);
      removeIds.forEach((id) => formData.append("removePhotoIds", String(id)));
      const result = await action(values, formData);
      if (!result.success) {
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, messages]) => {
            form.setError(key as keyof OccurrenceFormValues, {
              message: messages?.[0],
            });
          });
        }
        toast.error(result.message ?? "Não foi possível salvar.");
        return;
      }
      if (result.photoWarning) {
        toast.warning(result.photoWarning);
      } else {
        toast.success(result.message ?? "Salvo.");
      }
      if (result.code) {
        router.push(`${listHref}/${result.code}`);
      } else {
        router.push(listHref);
      }
      router.refresh();
    });
  }

  return (
    <form
      id="occurrence-form"
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.title) || undefined}>
          <FieldLabel htmlFor="title">Título</FieldLabel>
          <Input
            id="title"
            aria-invalid={Boolean(form.formState.errors.title)}
            {...form.register("title")}
          />
          <FieldError>{form.formState.errors.title?.message}</FieldError>
        </Field>

        <Field
          data-invalid={Boolean(form.formState.errors.description) || undefined}
        >
          <FieldLabel htmlFor="description">Descrição</FieldLabel>
          <Textarea
            id="description"
            rows={5}
            aria-invalid={Boolean(form.formState.errors.description)}
            {...form.register("description")}
          />
          <FieldError>{form.formState.errors.description?.message}</FieldError>
        </Field>

        <Field
          data-invalid={Boolean(form.formState.errors.categoryId) || undefined}
        >
          <FieldLabel>Categoria</FieldLabel>
          <Select
            value={
              form.watch("categoryId")
                ? String(form.watch("categoryId"))
                : undefined
            }
            onValueChange={(value) =>
              form.setValue("categoryId", Number(value), {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger
              aria-invalid={Boolean(form.formState.errors.categoryId)}
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldError>{form.formState.errors.categoryId?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Local</FieldLabel>
          <RadioGroup
            value={locationKind}
            onValueChange={(value) => {
              const kind = value as "common" | "custom";
              form.setValue("locationKind", kind);
              form.setValue(
                "locationValue",
                kind === "common" ? COMMON_AREAS[0] : ""
              );
            }}
          >
            <Field orientation="horizontal">
              <RadioGroupItem value="common" id="loc-common" />
              <FieldLabel htmlFor="loc-common" className="font-normal">
                Área comum
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <RadioGroupItem value="custom" id="loc-custom" />
              <FieldLabel htmlFor="loc-custom" className="font-normal">
                Texto livre
              </FieldLabel>
            </Field>
          </RadioGroup>
        </Field>

        {locationKind === "common" ? (
          <Field>
            <FieldLabel>Área comum</FieldLabel>
            <Select
              value={form.watch("locationValue")}
              onValueChange={(value) => form.setValue("locationValue", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {COMMON_AREAS.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        ) : (
          <Field
            data-invalid={
              Boolean(form.formState.errors.locationValue) || undefined
            }
          >
            <FieldLabel htmlFor="locationValue">Descreva o local</FieldLabel>
            <Input
              id="locationValue"
              aria-invalid={Boolean(form.formState.errors.locationValue)}
              {...form.register("locationValue")}
            />
            <FieldError>
              {form.formState.errors.locationValue?.message}
            </FieldError>
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="photos">
            Fotos (opcional, até {MAX_PHOTOS})
          </FieldLabel>
          {visiblePhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {visiblePhotos.map((photo) => (
                <div key={photo.id} className="flex flex-col gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    className="h-28 w-full rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRemoveIds((current) => [...current, photo.id])
                    }
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
          <Input
            id="photos"
            name="photos"
            type="file"
            accept="image/*"
            multiple
          />
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Salvando..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push(listHref)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
