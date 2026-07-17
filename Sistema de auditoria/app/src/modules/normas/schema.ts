import { z } from "zod";

export const normaSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "Código é obrigatório")
    .max(40, "Código muito longo"),
  nome: z.string().trim().min(1, "Nome é obrigatório").max(200),
  versao: z.string().trim().min(1, "Versão é obrigatória").max(20),
  familia: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((s) => (s ? s : null)),
  status: z.enum(["ATIVA", "EM_REVISAO", "DESCONTINUADA"], {
    message: "Selecione um status",
  }),
});

export type NormaInput = z.input<typeof normaSchema>;

export const controleSchema = z.object({
  codigo: z.string().trim().min(1, "Código é obrigatório").max(20),
  titulo: z.string().trim().min(1, "Título é obrigatório").max(300),
  descricao: z
    .string()
    .trim()
    .max(8000)
    .optional()
    .transform((s) => s ?? ""),
  parentId: z
    .string()
    .optional()
    .nullable()
    .transform((s) => (s ? s : null)),
  ativo: z.boolean().optional().default(true),
  processoIds: z.array(z.string()).optional().default([]),
});

export type ControleInput = z.input<typeof controleSchema>;
