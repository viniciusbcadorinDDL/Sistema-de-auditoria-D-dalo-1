import { getAllocationData, listAudits } from "@/modules/audits/queries";
import { AuditoriasClient, type AuditRow } from "./auditorias-client";

export const dynamic = "force-dynamic";

export default async function AuditoriasPage() {
  const [audits, allocation] = await Promise.all([
    listAudits(),
    getAllocationData(),
  ]);

  const rows: AuditRow[] = audits.map((a) => ({
    id: a.id,
    numero: a.numero,
    clienteNome: a.client.nomeFantasia || a.client.razaoSocial,
    normaCodigo: a.norma.codigo,
    tipo: a.tipo,
    leaderName: a.leader.name,
    dataInicio: a.dataInicio.toISOString(),
    dataFim: a.dataFim.toISOString(),
    status: a.status,
    checklistCount: a._count.checklist,
  }));

  return (
    <AuditoriasClient
      audits={rows}
      allocation={{
        clients: allocation.clients,
        processosByNorma: allocation.processosByNorma,
        auditorsByNorma: allocation.auditorsByNorma,
      }}
    />
  );
}
