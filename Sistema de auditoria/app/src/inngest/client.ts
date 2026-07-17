import { Inngest } from "inngest";

// Cliente Inngest para jobs agendados (lembretes de auditoria,
// alertas de certificados vencendo, geração de relatório, etc.).
export const inngest = new Inngest({
  id: "dedalo-auditorias",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
