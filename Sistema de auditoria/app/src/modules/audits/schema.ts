import { z } from "zod";

export const auditSchema = z
  .object({
    clientId: z.string().min(1, "Selecione o cliente"),
    normaId: z.string().min(1, "Selecione a norma"),
    tipo: z.enum(
      ["INICIAL", "MANUTENCAO", "RECERTIFICACAO", "ACOMPANHAMENTO"],
      { message: "Selecione o tipo" },
    ),
    escopo: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .transform((s) => (s ? s : null)),
    dataInicio: z.coerce.date({ message: "Data de início inválida" }),
    dataFim: z.coerce.date({ message: "Data de fim inválida" }),
    leaderId: z.string().min(1, "Selecione o auditor líder"),
    supportIds: z.array(z.string()).optional().default([]),
    processoIds: z.array(z.string()).optional().default([]),
    justificativa: z
      .string()
      .trim()
      .optional()
      .transform((s) => (s ? s : null)),
  })
  .refine((d) => d.dataFim >= d.dataInicio, {
    message: "A data de fim deve ser igual ou posterior ao início",
    path: ["dataFim"],
  });

export type AuditInput = z.input<typeof auditSchema>;
