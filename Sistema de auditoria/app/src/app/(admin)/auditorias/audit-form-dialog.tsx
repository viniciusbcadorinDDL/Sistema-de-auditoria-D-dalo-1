"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AUDIT_TYPE_LABEL } from "@/lib/labels";
import { createAudit } from "@/modules/audits/actions";

export type AllocationData = {
  clients: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    normas: { id: string; codigo: string }[];
  }[];
  processosByNorma: Record<string, { id: string; codigo: string; nome: string }[]>;
  auditorsByNorma: Record<
    string,
    { userId: string; name: string; certExpiresAt: string | null }[]
  >;
};

export function AuditFormDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: AllocationData;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [clientId, setClientId] = useState("");
  const [normaId, setNormaId] = useState("");
  const [tipo, setTipo] = useState("MANUTENCAO");
  const [leaderId, setLeaderId] = useState("");
  const [supportIds, setSupportIds] = useState<Set<string>>(new Set());
  const [processoIds, setProcessoIds] = useState<Set<string>>(new Set());
  const [warnings, setWarnings] = useState<string[]>([]);
  const [justificativa, setJustificativa] = useState("");

  useEffect(() => {
    if (open) {
      setErrors({});
      setClientId("");
      setNormaId("");
      setTipo("MANUTENCAO");
      setLeaderId("");
      setSupportIds(new Set());
      setProcessoIds(new Set());
      setWarnings([]);
      setJustificativa("");
    }
  }, [open]);

  const client = data.clients.find((c) => c.id === clientId);
  const normasDoCliente = client?.normas ?? [];
  const processos = normaId ? (data.processosByNorma[normaId] ?? []) : [];
  const auditores = normaId ? (data.auditorsByNorma[normaId] ?? []) : [];

  // Reset dependentes ao trocar cliente/norma.
  useEffect(() => {
    setNormaId("");
  }, [clientId]);
  useEffect(() => {
    setLeaderId("");
    setSupportIds(new Set());
    setProcessoIds(new Set());
    setWarnings([]);
    setJustificativa("");
  }, [normaId]);

  function toggle(set: Set<string>, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  const certVencido = leaderId
    ? !auditores.find((x) => x.userId === leaderId)?.certExpiresAt
    : false;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      clientId,
      normaId,
      tipo,
      escopo: String(form.get("escopo") ?? ""),
      dataInicio: String(form.get("dataInicio") ?? ""),
      dataFim: String(form.get("dataFim") ?? ""),
      leaderId,
      supportIds: [...supportIds],
      processoIds: [...processoIds],
      justificativa,
    };
    startTransition(async () => {
      const res = await createAudit(payload);
      if (res.ok) {
        toast.success("Auditoria criada e líder notificado.");
        onOpenChange(false);
        router.refresh();
      } else if ("warnings" in res) {
        setWarnings(res.warnings.map((w) => w.message));
        toast.warning("Reveja os avisos e justifique para prosseguir.");
      } else {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova auditoria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {data.clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nomeFantasia || c.razaoSocial}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-xs text-destructive">{errors.clientId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Norma</Label>
              <Select value={normaId} onValueChange={setNormaId} disabled={!clientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={clientId ? "Selecione" : "Escolha o cliente"} />
                </SelectTrigger>
                <SelectContent>
                  {normasDoCliente.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      {n.codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.normaId && <p className="text-xs text-destructive">{errors.normaId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AUDIT_TYPE_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataInicio">Início</Label>
              <Input id="dataInicio" name="dataInicio" type="date" />
              {errors.dataInicio && <p className="text-xs text-destructive">{errors.dataInicio}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataFim">Fim</Label>
              <Input id="dataFim" name="dataFim" type="date" />
              {errors.dataFim && <p className="text-xs text-destructive">{errors.dataFim}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Auditor líder</Label>
            <Select value={leaderId} onValueChange={setLeaderId} disabled={!normaId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={normaId ? "Selecione" : "Escolha a norma"} />
              </SelectTrigger>
              <SelectContent>
                {auditores.map((a) => (
                  <SelectItem key={a.userId} value={a.userId}>
                    {a.name}
                    {!a.certExpiresAt ? " — sem certificado" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {auditores.length === 0 && normaId && (
              <p className="text-xs text-amber-600">
                Nenhum auditor habilitado nesta norma.
              </p>
            )}
            {certVencido && (
              <p className="text-xs text-amber-600">
                Atenção: este auditor não possui certificado válido para a norma.
              </p>
            )}
          </div>

          {leaderId && auditores.length > 1 && (
            <div className="space-y-1.5">
              <Label>Equipe de apoio (opcional)</Label>
              <div className="flex flex-wrap gap-2">
                {auditores
                  .filter((a) => a.userId !== leaderId)
                  .map((a) => {
                    const on = supportIds.has(a.userId);
                    return (
                      <button
                        type="button"
                        key={a.userId}
                        onClick={() => setSupportIds((s) => toggle(s, a.userId))}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition-colors",
                          on ? "border-brand bg-brand text-white" : "border-border hover:bg-accent",
                        )}
                      >
                        {a.name}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {normaId && (
            <div className="space-y-1.5">
              <Label>Processos a auditar</Label>
              <p className="text-xs text-muted-foreground">
                Selecione os processos para filtrar o checklist. Se nenhum for
                escolhido, o checklist inclui todos os controles da norma.
              </p>
              <div className="flex flex-wrap gap-2">
                {processos.map((p) => {
                  const on = processoIds.has(p.id);
                  return (
                    <button
                      type="button"
                      key={p.id}
                      title={p.nome}
                      onClick={() => setProcessoIds((s) => toggle(s, p.id))}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        on ? "border-brand bg-brand text-white" : "border-border hover:bg-accent",
                      )}
                    >
                      {p.codigo}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="escopo">Escopo (opcional)</Label>
            <Textarea id="escopo" name="escopo" rows={2} />
          </div>

          {warnings.length > 0 && (
            <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <AlertTriangle className="size-4" />
                Avisos
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-amber-800">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <div className="space-y-1.5">
                <Label htmlFor="justificativa" className="text-amber-800">
                  Justificativa para prosseguir
                </Label>
                <Textarea
                  id="justificativa"
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  rows={2}
                  placeholder="Explique por que a alocação será mantida..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={pending || (warnings.length > 0 && justificativa.trim().length === 0)}
            >
              {pending ? "Criando..." : warnings.length > 0 ? "Confirmar mesmo assim" : "Criar auditoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
