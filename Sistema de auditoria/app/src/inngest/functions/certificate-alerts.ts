import { db } from "@/lib/db";
import { inngest } from "../client";

const JANELAS = [60, 30, 7]; // dias antes do vencimento

/**
 * Diariamente verifica certificados de auditores vencendo em 60, 30 e 7
 * dias e cria notificações para o auditor e para os administradores.
 * (O envio por e-mail via Resend é ligado quando RESEND_API_KEY existir.)
 */
export const certificateAlerts = inngest.createFunction(
  {
    id: "certificate-alerts",
    name: "Alerta de certificados vencendo",
    triggers: [{ cron: "0 8 * * *" }],
  },
  async ({ step }) => {
    const admins = await step.run("buscar-admins", () =>
      db.user.findMany({ where: { role: "ADMIN", active: true }, select: { id: true } }),
    );

    let total = 0;
    for (const dias of JANELAS) {
      const inicio = new Date();
      inicio.setHours(0, 0, 0, 0);
      inicio.setDate(inicio.getDate() + dias);
      const fim = new Date(inicio);
      fim.setDate(fim.getDate() + 1);

      const certs = await step.run(`certs-${dias}d`, () =>
        db.auditorCertificate.findMany({
          where: { expiresAt: { gte: inicio, lt: fim } },
          include: {
            auditor: { include: { user: { select: { id: true, name: true } } } },
            norma: { select: { codigo: true } },
          },
        }),
      );

      for (const cert of certs) {
        const destinatarios = new Set<string>([
          cert.auditor.user.id,
          ...admins.map((a) => a.id),
        ]);
        const payload = {
          certificateId: cert.id,
          auditor: cert.auditor.user.name,
          tipo: cert.type,
          norma: cert.norma?.codigo ?? null,
          diasParaVencer: dias,
          expiresAt: cert.expiresAt,
        };
        await step.run(`notificar-${cert.id}`, async () => {
          await db.notification.createMany({
            data: [...destinatarios].map((userId) => ({
              userId,
              evento: "CERTIFICADO_VENCENDO",
              payload,
            })),
          });
        });
        total += destinatarios.size;
      }
    }

    return { notificacoesCriadas: total };
  },
);
