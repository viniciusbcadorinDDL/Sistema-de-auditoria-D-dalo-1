import { z } from "zod";
import { formatCnpj, formatCpf, isValidCnpj, isValidCpf } from "@/lib/br-docs";

/** Número opcional: string vazia/null vira undefined antes de validar. */
const optionalMoney = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().nonnegative("Valor inválido").optional(),
);

export const auditorSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  cpf: z
    .string()
    .trim()
    .min(1, "CPF é obrigatório")
    .refine(isValidCpf, "CPF inválido")
    .transform(formatCpf),
  cnpj: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isValidCnpj(v), "CNPJ inválido")
    .transform((v) => (v ? formatCnpj(v) : null)),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((s) => (s ? s : null)),
  dailyRate: optionalMoney,
  hourlyRate: optionalMoney,
  normaIds: z.array(z.string()).optional().default([]),
});

export type AuditorInput = z.input<typeof auditorSchema>;

export const certificateSchema = z
  .object({
    type: z.string().trim().min(1, "Tipo é obrigatório").max(120),
    issuer: z.string().trim().min(1, "Emissor é obrigatório").max(120),
    issuedAt: z.coerce.date({ message: "Data de emissão inválida" }),
    expiresAt: z.coerce.date({ message: "Data de validade inválida" }),
    normaId: z
      .string()
      .optional()
      .transform((s) => (s ? s : null)),
  })
  .refine((d) => d.expiresAt > d.issuedAt, {
    message: "A validade deve ser posterior à emissão",
    path: ["expiresAt"],
  });

export type CertificateInput = z.input<typeof certificateSchema>;
