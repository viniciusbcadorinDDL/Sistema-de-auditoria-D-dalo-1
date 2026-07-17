"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { sendEmail } from "@/lib/email";
import { auditAssignedEmail } from "@/emails/audit-assigned";
import { type ActionResult, toActionError } from "@/lib/actions";
import { auditSchema } from "./schema";
import { type AuditWarning, evaluateWarnings } from "./warnings";

export type CreateAuditResult =
  | ActionResult
  | { ok: false; error: string; warnings: AuditWarning[]; needsJustification: true };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function fmt(d: Date) {
  return d.toLocaleDateString("pt-BR");
}

async function notificarLider(params: {
  leaderId: string;
  leaderName: string;
  leaderEmail: string;
  numero: string;
  cliente: string;
  norma: string;
  dataInicio: Date;
  dataFim: Date;
}) {
  await db.notification.create({
    data: {
      userId: params.leaderId,
      evento: "AUDITORIA_ATRIBUIDA",
      payload: {
        numero: params.numero,
        cliente: params.cliente,
        norma: params.norma,
      },
    },
  });
  const { subject, html } = auditAssignedEmail({
    leaderName: params.leaderName,
    numero: params.numero,
    cliente: params.cliente,
    norma: params.norma,
    dataInicio: fmt(params.dataInicio),
    dataFim: fmt(params.dataFim),
    appUrl: APP_URL,
  });
  await sendEmail({ to: params.leaderEmail, subject, html });
}

export async function createAudit(raw: unknown): Promise<CreateAuditResult> {
  try {
    const admin = await requireAdmin();
    const data = auditSchema.parse(raw);

    const [leader, norma, ultimas] = await Promise.all([
      db.user.findUnique({
        where: { id: data.leaderId },
        select: { id: true, name: true, email: true },
      }),
      db.norma.findUnique({
        where: { id: data.normaId },
        select: { codigo: true },
      }),
      db.audit.findMany({
        where: { clientId: data.clientId },
        orderBy: { dataInicio: "desc" },
        take: 2,
        select: { leaderId: true },
      }),
    ]);
    if (!leader) return { ok: false, error: "Auditor líder não encontrado." };
    if (!norma) return { ok: false, error: "Norma não encontrada." };

    const auditor = await db.auditor.findFirst({
      where: { userId: data.leaderId },
      select: {
        certificates: {
          where: { normaId: data.normaId },
          orderBy: { expiresAt: "desc" },
          take: 1,
          select: { expiresAt: true },
        },
      },
    });

    const warnings = evaluateWarnings({
      leaderId: data.leaderId,
      leaderName: leader.name,
      normaCodigo: norma.codigo,
      certExpiresAt: auditor?.certificates[0]?.expiresAt ?? null,
      dataInicio: data.dataInicio,
      ultimosLideresIds: ultimas.map((a) => a.leaderId),
    });

    if (warnings.length > 0 && !data.justificativa) {
      return {
        ok: false,
        error: "Há avisos que exigem justificativa para prosseguir.",
        warnings,
        needsJustification: true,
      };
    }

    const cliente = await db.client.findUnique({
      where: { id: data.clientId },
      select: { razaoSocial: true },
    });

    const audit = await db.$transaction(async (tx) => {
      const year = data.dataInicio.getFullYear();
      const count = await tx.audit.count({
        where: { numero: { startsWith: `${year}-` } },
      });
      const numero = `${year}-${String(count + 1).padStart(3, "0")}`;

      // Snapshot dos controles ativos filtrados pelos processos (RN-13/14).
      const controles = await tx.normaControle.findMany({
        where: {
          normaId: data.normaId,
          ativo: true,
          ...(data.processoIds.length
            ? { processos: { some: { id: { in: data.processoIds } } } }
            : {}),
        },
        select: { id: true, codigo: true, titulo: true, descricao: true },
      });

      return tx.audit.create({
        data: {
          numero,
          clientId: data.clientId,
          normaId: data.normaId,
          tipo: data.tipo,
          escopo: data.escopo,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          leaderId: data.leaderId,
          status: "PLANEJADA",
          support: { connect: data.supportIds.map((id) => ({ id })) },
          processos: { connect: data.processoIds.map((id) => ({ id })) },
          checklist: {
            create: controles.map((c) => ({
              controleId: c.id,
              controleCodigo: c.codigo,
              controleTitulo: c.titulo,
              controleDesc: c.descricao,
            })),
          },
        },
      });
    });

    await logAction({
      userId: admin.id,
      entidade: "Audit",
      entidadeId: audit.id,
      acao: "CREATE",
      payload: {
        numero: audit.numero,
        warnings: warnings.map((w) => w.code),
        justificativa: data.justificativa ?? undefined,
      },
    });

    await notificarLider({
      leaderId: leader.id,
      leaderName: leader.name,
      leaderEmail: leader.email,
      numero: audit.numero,
      cliente: cliente?.razaoSocial ?? "",
      norma: norma.codigo,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
    });

    revalidatePath("/auditorias");
    revalidatePath("/cronograma");
    revalidatePath("/dashboard");
    return { ok: true, id: audit.id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateAudit(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = auditSchema.parse(raw);

    await db.audit.update({
      where: { id },
      data: {
        tipo: data.tipo,
        escopo: data.escopo,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        support: { set: data.supportIds.map((sid) => ({ id: sid })) },
      },
    });
    await logAction({
      userId: admin.id,
      entidade: "Audit",
      entidadeId: id,
      acao: "UPDATE",
    });
    revalidatePath("/auditorias");
    revalidatePath(`/auditorias/${id}`);
    revalidatePath("/cronograma");
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function cancelAudit(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const audit = await db.audit.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!audit) return { ok: false, error: "Auditoria não encontrada." };
    if (audit.status === "CONCLUIDA") {
      return { ok: false, error: "Auditoria concluída não pode ser cancelada." };
    }
    await db.audit.update({ where: { id }, data: { status: "CANCELADA" } });
    await logAction({
      userId: admin.id,
      entidade: "Audit",
      entidadeId: id,
      acao: "UPDATE",
      payload: { status: "CANCELADA" },
    });
    revalidatePath("/auditorias");
    revalidatePath(`/auditorias/${id}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function reassignLeader(
  id: string,
  newLeaderId: string,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const [audit, leader] = await Promise.all([
      db.audit.findUnique({
        where: { id },
        include: {
          client: { select: { razaoSocial: true } },
          norma: { select: { codigo: true } },
        },
      }),
      db.user.findUnique({
        where: { id: newLeaderId },
        select: { id: true, name: true, email: true },
      }),
    ]);
    if (!audit) return { ok: false, error: "Auditoria não encontrada." };
    if (!leader) return { ok: false, error: "Novo líder não encontrado." };

    await db.audit.update({ where: { id }, data: { leaderId: newLeaderId } });
    await logAction({
      userId: admin.id,
      entidade: "Audit",
      entidadeId: id,
      acao: "UPDATE",
      payload: { reassignLeader: newLeaderId },
    });
    await notificarLider({
      leaderId: leader.id,
      leaderName: leader.name,
      leaderEmail: leader.email,
      numero: audit.numero,
      cliente: audit.client.razaoSocial,
      norma: audit.norma.codigo,
      dataInicio: audit.dataInicio,
      dataFim: audit.dataFim,
    });
    revalidatePath("/auditorias");
    revalidatePath(`/auditorias/${id}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}
