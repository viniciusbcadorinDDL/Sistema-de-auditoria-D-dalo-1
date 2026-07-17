import { listAuditors } from "@/modules/auditors/queries";
import { listNormas } from "@/modules/normas/queries";
import { AuditoresClient } from "./auditores-client";

export const dynamic = "force-dynamic";

export default async function AuditoresPage() {
  const [auditores, normas] = await Promise.all([listAuditors(), listNormas()]);

  return (
    <AuditoresClient
      auditores={auditores.map((a) => ({
        id: a.id,
        name: a.user.name,
        email: a.user.email,
        active: a.user.active,
        cpf: a.cpf,
        cnpj: a.cnpj,
        phone: a.phone,
        dailyRate: a.dailyRate ? a.dailyRate.toString() : null,
        normas: a.normas,
        certCount: a._count.certificates,
      }))}
      normas={normas.map((n) => ({ id: n.id, codigo: n.codigo }))}
    />
  );
}
