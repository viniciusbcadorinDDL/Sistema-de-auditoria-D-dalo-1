import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAudit, getAllocationData } from "@/modules/audits/queries";
import { AUDIT_TYPE_LABEL } from "@/lib/labels";
import { StatusBadge } from "../auditorias-client";
import { AuditDetailActions } from "./audit-detail-actions";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return d.toLocaleDateString("pt-BR");
}

export default async function AuditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const audit = await getAudit(id);
  if (!audit) notFound();

  const allocation = await getAllocationData();
  const auditores = allocation.auditorsByNorma[audit.norma.id] ?? [];

  const total = audit.checklist.length;
  const preenchidos = audit.checklist.filter((c) => c.classification).length;

  return (
    <>
      <PageHeader
        crumb={
          <span>
            <Link href="/auditorias" className="hover:underline">
              Auditorias
            </Link>{" "}
            / {audit.numero}
          </span>
        }
        title={`${audit.numero} — ${audit.client.nomeFantasia || audit.client.razaoSocial}`}
        actions={
          <AuditDetailActions
            id={audit.id}
            status={audit.status}
            currentLeaderId={audit.leader.id}
            auditores={auditores.map((a) => ({ userId: a.userId, name: a.name }))}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Linha label="Status" value={<StatusBadge status={audit.status} />} />
            <Linha label="Norma" value={audit.norma.codigo} />
            <Linha label="Tipo" value={AUDIT_TYPE_LABEL[audit.tipo]} />
            <Linha label="Líder" value={audit.leader.name} />
            <Linha label="Período" value={`${fmt(audit.dataInicio)} → ${fmt(audit.dataFim)}`} />
            <div>
              <div className="text-muted-foreground">Apoio</div>
              <div>{audit.support.map((s) => s.name).join(", ") || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Escopo</div>
              <div>{audit.escopo ?? "—"}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Checklist e processos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-6">
              <Metric value={total} label="Itens no checklist" />
              <Metric value={preenchidos} label="Classificados" />
              <Metric value={total - preenchidos} label="Pendentes" />
            </div>
            <div>
              <div className="mb-2 text-sm text-muted-foreground">
                Processos auditados
              </div>
              <div className="flex flex-wrap gap-1">
                {audit.processos.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Todos os controles da norma (sem filtro de processo).
                  </span>
                ) : (
                  audit.processos.map((p) => (
                    <Badge key={p.id} variant="secondary" title={p.nome}>
                      {p.codigo}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              A execução do checklist (evidências e classificação) acontece na
              Console do Auditor (Sprint 3).
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Linha({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-brand">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
