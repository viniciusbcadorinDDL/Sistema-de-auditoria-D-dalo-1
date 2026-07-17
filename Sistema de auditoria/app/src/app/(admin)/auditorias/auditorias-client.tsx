"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AUDIT_STATUS_LABEL, AUDIT_TYPE_LABEL } from "@/lib/labels";
import { AuditFormDialog, type AllocationData } from "./audit-form-dialog";

export type AuditRow = {
  id: string;
  numero: string;
  clienteNome: string;
  normaCodigo: string;
  tipo: string;
  leaderName: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  checklistCount: number;
};

const TABS: { key: string; label: string }[] = [
  { key: "ALL", label: "Todas" },
  { key: "PLANEJADA", label: "Planejadas" },
  { key: "EM_EXECUCAO", label: "Em execução" },
  { key: "PENDENTE_RELATORIO", label: "Pendentes relatório" },
  { key: "CONCLUIDA", label: "Concluídas" },
  { key: "ATRASADA", label: "Atrasadas" },
];

export const STATUS_BADGE: Record<string, string> = {
  PLANEJADA: "bg-sky-600 hover:bg-sky-600",
  PLANO_PENDENTE: "bg-amber-500 hover:bg-amber-500",
  EM_EXECUCAO: "bg-indigo-600 hover:bg-indigo-600",
  PENDENTE_RELATORIO: "bg-amber-600 hover:bg-amber-600",
  CONCLUIDA: "bg-emerald-600 hover:bg-emerald-600",
  ATRASADA: "bg-red-600 hover:bg-red-600",
  CANCELADA: "bg-zinc-400 hover:bg-zinc-400",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={STATUS_BADGE[status] ?? ""}>
      {AUDIT_STATUS_LABEL[status as keyof typeof AUDIT_STATUS_LABEL] ?? status}
    </Badge>
  );
}

export function AuditoriasClient({
  audits,
  allocation,
}: {
  audits: AuditRow[];
  allocation: AllocationData;
}) {
  const [tab, setTab] = useState("ALL");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => (tab === "ALL" ? audits : audits.filter((a) => a.status === tab)),
    [audits, tab],
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const a of audits) m[a.status] = (m[a.status] ?? 0) + 1;
    return m;
  }, [audits]);

  return (
    <>
      <PageHeader
        crumb="Operação"
        title="Auditorias"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Nova Auditoria
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1 border-b">
        {TABS.map((t) => {
          const n = t.key === "ALL" ? audits.length : (counts[t.key] ?? 0);
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "border-b-2 px-3 py-2 text-sm transition-colors",
                tab === t.key
                  ? "border-brand font-medium text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span className="ml-1.5 text-xs text-muted-foreground">{n}</span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Norma</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Líder</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono">{a.numero}</TableCell>
                  <TableCell>{a.clienteNome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{a.normaCodigo}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {AUDIT_TYPE_LABEL[a.tipo as keyof typeof AUDIT_TYPE_LABEL] ?? a.tipo}
                  </TableCell>
                  <TableCell>{a.leaderName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(a.dataInicio).toLocaleDateString("pt-BR")} –{" "}
                    {new Date(a.dataFim).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/auditorias/${a.id}`}
                      className="text-sm text-brand hover:underline"
                    >
                      Abrir →
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Nenhuma auditoria nesta categoria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AuditFormDialog open={open} onOpenChange={setOpen} data={allocation} />
    </>
  );
}
