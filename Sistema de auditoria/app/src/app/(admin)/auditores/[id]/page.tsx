import { notFound } from "next/navigation";
import { getAuditor } from "@/modules/auditors/queries";
import { listNormas } from "@/modules/normas/queries";
import { AuditorDetailClient } from "./auditor-detail-client";

export const dynamic = "force-dynamic";

export default async function AuditorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [auditor, normas] = await Promise.all([getAuditor(id), listNormas()]);
  if (!auditor) notFound();

  return (
    <AuditorDetailClient
      auditor={{
        id: auditor.id,
        name: auditor.user.name,
        email: auditor.user.email,
        active: auditor.user.active,
        cpf: auditor.cpf,
        cnpj: auditor.cnpj,
        phone: auditor.phone,
        dailyRate: auditor.dailyRate ? auditor.dailyRate.toString() : null,
        normas: auditor.normas,
      }}
      certs={auditor.certificates.map((c) => ({
        id: c.id,
        type: c.type,
        issuer: c.issuer,
        issuedAt: c.issuedAt.toISOString(),
        expiresAt: c.expiresAt.toISOString(),
        fileUrl: c.fileUrl,
        normaCodigo: c.norma?.codigo ?? null,
      }))}
      normas={normas.map((n) => ({ id: n.id, codigo: n.codigo }))}
    />
  );
}
