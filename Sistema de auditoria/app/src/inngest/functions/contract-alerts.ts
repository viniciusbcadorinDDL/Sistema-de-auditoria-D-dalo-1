import { db } from "@/lib/db";
import { inngest } from "../client";

const DIAS_ANTES = 90;

/**
 * Diariamente verifica clientes cujo contrato vence em ~90 dias e
 * notifica os administradores para renovação.
 */
export const contractAlerts = inngest.createFunction(
  {
    id: "contract-alerts",
    name: "Alerta de vencimento de contrato",
    triggers: [{ cron: "0 8 * * *" }],
  },
  async ({ step }) => {
    const admins = await step.run("buscar-admins", () =>
      db.user.findMany({
        where: { role: "ADMIN", active: true },
        select: { id: true },
      }),
    );

    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    inicio.setDate(inicio.getDate() + DIAS_ANTES);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);

    const clientes = await step.run("clientes-vencendo", () =>
      db.client.findMany({
        where: { archived: false, contractEnd: { gte: inicio, lt: fim } },
        select: { id: true, razaoSocial: true, contractEnd: true },
      }),
    );

    let total = 0;
    for (const c of clientes) {
      await step.run(`notificar-${c.id}`, async () => {
        await db.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            evento: "CONTRATO_VENCENDO",
            payload: {
              clientId: c.id,
              cliente: c.razaoSocial,
              diasParaVencer: DIAS_ANTES,
              contractEnd: c.contractEnd,
            },
          })),
        });
      });
      total += admins.length;
    }

    return { notificacoesCriadas: total };
  },
);
