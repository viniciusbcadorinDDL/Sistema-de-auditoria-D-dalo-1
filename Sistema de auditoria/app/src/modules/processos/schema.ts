import { z } from "zod";

export const processoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(1, "Código é obrigatório")
    .max(10, "Código deve ter no máximo 10 caracteres")
    .regex(/^[A-Za-z0-9]+$/, "Use apenas letras e números")
    .transform((s) => s.toUpperCase()),
  nome: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(120, "Nome muito longo"),
  descricao: z
    .string()
    .trim()
    .max(500, "Descrição muito longa")
    .optional()
    .transform((s) => (s ? s : null)),
  categoria: z.enum(["OPERACIONAL", "SUPORTE", "GESTAO"], {
    message: "Selecione uma categoria",
  }),
});

export type ProcessoInput = z.input<typeof processoSchema>;
export type ProcessoParsed = z.output<typeof processoSchema>;
