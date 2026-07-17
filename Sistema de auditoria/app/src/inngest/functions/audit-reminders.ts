import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { inngest } from "../client";

function janela(diasFrente: number) {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() + diasFrente);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 1);
  return { inicio, fim };
}

async function notificar(
  userId: string,
  evento: string,
  payload: Record<string, unknown>,
) {
  await db.notification.create({
    data: { userId, evento, payload: payload as Prisma.InputJsonValue },
  });
}

/** 30 dias antes da auditoria, lembra o líder de enviar o plano (se ainda não há). */
export const remindAuditPlan = inngest.createFunction(
  {
    id: "remind-audit-plan",
    name: "Lembrete: plano de auditoria (30d)",
    triggers: [{ cron: "0 8 * * *" }],
  },
  async ({ step }) => {
    const { inicio, fim } = janela(30);
    const audits = await step.run("buscar", () =>
      db.audit.findMany({
        where: {
          dataInicio: { gte: inicio, lt: fim },
          status: { in: ["PLANEJADA", "PLANO_PENDENTE"] },
          plan: { is: null },
        },
        select: { id: true, numero: true, leaderId: true },
      }),
    );
    for (const a of audits) {
      await step.run(`notif-${a.id}`, () =>
        notificar(a.leaderId, "PLANO_PENDENTE_30D", { auditId: a.id, numero: a.numero }),
      );
    }
    return { lembretes: audits.length };
  },
);

/** 15 e 3 dias antes da auditoria, lembra o líder da proximidade. */
export const remindAuditClose = inngest.createFunction(
  {
    id: "remind-audit-close",
    name: "Lembrete: auditoria próxima (15d/3d)",
    triggers: [{ cron: "0 8 * * *" }],
  },
  async ({ step }) => {
    let total = 0;
    for (const dias of [15, 3]) {
      const { inicio, fim } = janela(dias);
      const audits = await step.run(`buscar-${dias}`, () =>
        db.audit.findMany({
          where: {
            dataInicio: { gte: inicio, lt: fim },
            status: { in: ["PLANEJADA", "PLANO_PENDENTE", "EM_EXECUCAO"] },
          },
          select: { id: true, numero: true, leaderId: true },
        }),
      );
      for (const a of audits) {
        await step.run(`notif-${dias}-${a.id}`, () =>
          notificar(a.leaderId, "AUDITORIA_PROXIMA", {
            auditId: a.id,
            numero: a.numero,
            dias,
          }),
        );
        total++;
      }
    }
    return { lembretes: total };
  },
);

/** 15 dias após o fim sem relatório aprovado: marca a auditoria como ATRASADA. */
export const checkOverdueReports = inngest.createFunction(
  {
    id: "check-overdue-reports",
    name: "Relatórios atrasados (15d após fim)",
    triggers: [{ cron: "0 8 * * *" }],
  },
  async ({ step }) => {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - 15);

    const audits = await step.run("buscar", () =>
      db.audit.findMany({
        where: {
          dataFim: { lt: cutoff },
          status: {
            in: ["PLANEJADA", "PLANO_PENDENTE", "EM_EXECUCAO", "PENDENTE_RELATORIO"],
          },
          OR: [{ report: { is: null } }, { report: { is: { approvedAt: null } } }],
        },
        select: { id: true, numero: true, leaderId: true },
      }),
    );

    for (const a of audits) {
      await step.run(`atrasar-${a.id}`, async () => {
        await db.audit.update({ where: { id: a.id }, data: { status: "ATRASADA" } });
        await notificar(a.leaderId, "RELATORIO_ATRASADO", {
          auditId: a.id,
          numero: a.numero,
        });
      });
    }
    return { atrasadas: audits.length };
  },
);
