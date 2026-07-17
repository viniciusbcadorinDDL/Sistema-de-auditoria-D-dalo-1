import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type AuditAcao =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "INACTIVATE"
  | "ARCHIVE"
  | "VIEW"
  | "DOWNLOAD"
  | "LOGIN"
  | "LOGOUT";

/**
 * Registra uma entrada em AuditLog. Toda escrita no banco deve gerar uma
 * entrada (ver CLAUDE.md). Nunca logar PII em texto plano no payload.
 */
export async function logAction(params: {
  userId?: string | null;
  entidade: string;
  entidadeId: string;
  acao: AuditAcao;
  payload?: Record<string, unknown>;
}) {
  await db.auditLog.create({
    data: {
      userId: params.userId ?? null,
      entidade: params.entidade,
      entidadeId: params.entidadeId,
      acao: params.acao,
      payload: (params.payload ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    },
  });
}
