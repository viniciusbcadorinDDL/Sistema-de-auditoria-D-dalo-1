import { z } from "zod";
import { formatCnpj, isValidCnpj } from "@/lib/br-docs";

export const PERIODICIDADES = [
  "ANUAL",
  "SEMESTRAL",
  "TRIMESTRAL",
  "CUSTOM",
] as const;
export type Periodicidade = (typeof PERIODICIDADES)[number];

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((s) => (s ? s : null));

const optionalInt = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().int().nonnegative().optional(),
);

const optionalMoney = z.preprocess(
  (v) => (v === "" || v == null ? undefined : v),
  z.coerce.number().nonnegative().optional(),
);

const contatoSchema = z.object({
  nome: z.string().trim().min(1, "Nome do contato é obrigatório"),
  cargo: z
    .string()
    .trim()
    .optional()
    .transform((s) => s ?? ""),
  email: z
    .string()
    .trim()
    .optional()
    .transform((s) => s ?? ""),
  telefone: z
    .string()
    .trim()
    .optional()
    .transform((s) => s ?? ""),
});

const clientNormaSchema = z
  .object({
    normaId: z.string().min(1),
    periodicidade: z.enum(PERIODICIDADES),
    customMeses: z.preprocess(
      (v) => (v === "" || v == null ? undefined : v),
      z.coerce.number().int().positive().optional(),
    ),
  })
  .refine((d) => d.periodicidade !== "CUSTOM" || !!d.customMeses, {
    message: "Informe a periodicidade em meses",
    path: ["customMeses"],
  });

export const clientSchema = z
  .object({
    razaoSocial: z.string().trim().min(1, "Razão social é obrigatória").max(200),
    nomeFantasia: optionalText,
    cnpj: z
      .string()
      .trim()
      .min(1, "CNPJ é obrigatório")
      .refine(isValidCnpj, "CNPJ inválido")
      .transform(formatCnpj),
    setor: optionalText,
    porte: optionalText,
    numColaboradores: optionalInt,
    contractStart: z.coerce.date({ message: "Início do contrato inválido" }),
    contractEnd: z.coerce.date({ message: "Fim do contrato inválido" }),
    contractValue: optionalMoney,
    contacts: z.array(contatoSchema).min(1, "Informe ao menos um contato"),
    normas: z.array(clientNormaSchema).optional().default([]),
  })
  .refine((d) => d.contractEnd > d.contractStart, {
    message: "O fim do contrato deve ser posterior ao início",
    path: ["contractEnd"],
  });

export type ClientInput = z.input<typeof clientSchema>;
