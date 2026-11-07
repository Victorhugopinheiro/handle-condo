import { z } from "zod";
import { COMMON_AREAS, OCCURRENCE_STATUSES } from "@/lib/constants";

export const occurrenceFormSchema = z
  .object({
    title: z.string().trim().min(1, "Informe o título"),
    description: z.string().trim().min(1, "Informe a descrição"),
    categoryId: z
      .number({ error: "Escolha uma categoria" })
      .int()
      .positive("Escolha uma categoria"),
    locationKind: z.enum(["common", "custom"]),
    locationValue: z.string().trim().min(1, "Informe o local"),
  })
  .superRefine((data, ctx) => {
    if (data.locationKind === "common") {
      if (
        !COMMON_AREAS.includes(
          data.locationValue as (typeof COMMON_AREAS)[number]
        )
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["locationValue"],
          message: "Escolha uma área comum da lista",
        });
      }
    }
  });

export type OccurrenceFormValues = z.infer<typeof occurrenceFormSchema>;

export const occurrenceStatusSchema = z.enum(OCCURRENCE_STATUSES);

export const residentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome completo")
    .refine((value) => value.split(/\s+/).filter(Boolean).length >= 2, {
      message: "Informe nome e sobrenome",
    }),
  email: z.email("Informe um e-mail válido"),
  unit: z.string().trim().min(1, "Informe torre/apartamento"),
  phone: z.string().trim().min(1, "Informe o telefone"),
});

export type ResidentFormValues = z.infer<typeof residentFormSchema>;

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da categoria"),
});

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe a senha"),
});

export const residentAccessSchema = z.object({
  email: z.email("Informe um e-mail válido"),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Escreva um comentário"),
});
