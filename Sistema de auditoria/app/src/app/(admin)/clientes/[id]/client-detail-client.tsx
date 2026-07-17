"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/domain/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AUDIT_STATUS_LABEL } from "@/lib/labels";
import {
  ClientFormDialog,
  type ClienteEdicao,
  type NormaOpcao,
} from "../client-form-dialog";
import { deleteClient, setClientArchived } from "@/modules/clients/actions";

type AuditItem = {
  id: string;
  numero: string;
  normaCodigo: string;
  dataInicio: string;
  status: string;
};
type CronogramaNorma = { normaCodigo: string; datas: string[] };

export type ClienteDisplay = ClienteEdicao & {
  archived: boolean;
  setorLabel: string;
  porteLabel: string;
  numColaboradoresLabel: string;
  contractValueLabel: string;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function ClientDetailClient({
  cliente,
  normas,
  audits,
  cronograma,
}: {
  cliente: ClienteDisplay;
  normas: NormaOpcao[];
  audits: AuditItem[];
  cronograma: CronogramaNorma[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  function toggleArchive() {
    startTransition(async () => {
      const res = await setClientArchived(cliente.id, !cliente.archived);
      if (res.ok) {
        toast.success(cliente.archived ? "Cliente reativado." : "Cliente arquivado.");
        router.refresh();
      } else toast.error(res.error);
    });
  }
  function excluir() {
    if (!confirm("Excluir este cliente? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const res = await deleteClient(cliente.id);
      if (res.ok) {
        toast.success("Cliente excluído.");
        router.push("/clientes");
      } else toast.error(res.error);
    });
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const passadas = audits.filter((a) => a.dataInicio.slice(0, 10) < hoje);
  const futuras = audits.filter((a) => a.dataInicio.slice(0, 10) >= hoje);

  return (
    <>
      <PageHeader
        crumb={
          <span>
            <Link href="/clientes" className="hover:underline">
              Clientes
            </Link>{" "}
            / {cliente.razaoSocial}
          </span>
        }
        title={cliente.nomeFantasia || cliente.razaoSocial}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
            <Button variant="outline" onClick={toggleArchive} disabled={pending}>
              {cliente.archived ? "Reativar" : "Arquivar"}
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={excluir}
              disabled={pending}
            >
              Excluir
            </Button>
          </div>
        }
      />

      {cliente.archived && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Este cliente está arquivado.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Linha label="Razão social" value={cliente.razaoSocial} />
            <Linha label="CNPJ" value={cliente.cnpj} />
            <Linha label="Setor" value={cliente.setorLabel} />
            <Linha label="Porte" value={cliente.porteLabel} />
            <Linha label="Colaboradores" value={cliente.numColaboradoresLabel} />
            <Linha label="Contrato" value={`${fmt(cliente.contractStart)} → ${fmt(cliente.contractEnd)}`} />
            <Linha label="Valor" value={cliente.contractValueLabel} />
            <div className="pt-1">
              <div className="mb-1 text-muted-foreground">Contato</div>
              <div className="font-medium">{cliente.contato.nome}</div>
              <div className="text-xs text-muted-foreground">
                {[cliente.contato.cargo, cliente.contato.email, cliente.contato.telefone]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Auditorias (timeline)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TimelineSection titulo="Próximas" items={futuras} vazio="Nenhuma auditoria futura agendada." />
            <TimelineSection titulo="Realizadas" items={passadas} vazio="Nenhuma auditoria no histórico." />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Cronograma sugerido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Datas previstas com base na periodicidade contratada de cada norma
            (sugestão — as auditorias são criadas na alocação).
          </p>
          {cronograma.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma norma contratada com periodicidade definida.
            </p>
          )}
          {cronograma.map((c) => (
            <div key={c.normaCodigo} className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="w-28 justify-center">
                {c.normaCodigo}
              </Badge>
              {c.datas.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  Sem ocorrências dentro da vigência.
                </span>
              ) : (
                c.datas.map((d) => (
                  <Badge key={d} variant="secondary">
                    {fmt(d)}
                  </Badge>
                ))
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        cliente={cliente}
        normas={normas}
      />
    </>
  );
}

function TimelineSection({
  titulo,
  items,
  vazio,
}: {
  titulo: string;
  items: AuditItem[];
  vazio: string;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-3 text-sm">
              <span className="font-mono">{a.numero}</span>
              <Badge variant="secondary">{a.normaCodigo}</Badge>
              <span className="text-muted-foreground">{fmt(a.dataInicio)}</span>
              <Badge variant="outline">
                {AUDIT_STATUS_LABEL[a.status as keyof typeof AUDIT_STATUS_LABEL] ?? a.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Linha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
