"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient, updateClient } from "@/modules/clients/actions";

export type NormaOpcao = { id: string; codigo: string };
export type ClienteEdicao = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  setor: string | null;
  porte: string | null;
  numColaboradores: number | null;
  contractStart: string; // yyyy-mm-dd
  contractEnd: string;
  contractValue: string | null;
  contato: { nome: string; cargo: string; email: string; telefone: string };
  normas: { normaId: string; periodicidade: string; customMeses: number | null }[];
};

const PERIODICIDADE_LABEL: Record<string, string> = {
  ANUAL: "Anual",
  SEMESTRAL: "Semestral",
  TRIMESTRAL: "Trimestral",
  CUSTOM: "Personalizada",
};

type NormaSel = { periodicidade: string; customMeses: string };

function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id?: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ClientFormDialog({
  open,
  onOpenChange,
  cliente,
  normas,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClienteEdicao | null;
  normas: NormaOpcao[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [porte, setPorte] = useState("");
  const [sel, setSel] = useState<Record<string, NormaSel>>({});
  const isEdit = !!cliente;

  useEffect(() => {
    if (open) {
      setErrors({});
      setPorte(cliente?.porte ?? "Médio");
      const inicial: Record<string, NormaSel> = {};
      for (const n of cliente?.normas ?? []) {
        inicial[n.normaId] = {
          periodicidade: n.periodicidade,
          customMeses: n.customMeses ? String(n.customMeses) : "",
        };
      }
      setSel(inicial);
    }
  }, [open, cliente]);

  function toggleNorma(id: string) {
    setSel((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = { periodicidade: "ANUAL", customMeses: "" };
      return next;
    });
  }
  function setPeriodicidade(id: string, periodicidade: string) {
    setSel((prev) => ({ ...prev, [id]: { ...prev[id]!, periodicidade } }));
  }
  function setCustom(id: string, customMeses: string) {
    setSel((prev) => ({ ...prev, [id]: { ...prev[id]!, customMeses } }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      razaoSocial: String(form.get("razaoSocial") ?? ""),
      nomeFantasia: String(form.get("nomeFantasia") ?? ""),
      cnpj: String(form.get("cnpj") ?? ""),
      setor: String(form.get("setor") ?? ""),
      porte,
      numColaboradores: String(form.get("numColaboradores") ?? ""),
      contractStart: String(form.get("contractStart") ?? ""),
      contractEnd: String(form.get("contractEnd") ?? ""),
      contractValue: String(form.get("contractValue") ?? ""),
      contacts: [
        {
          nome: String(form.get("contatoNome") ?? ""),
          cargo: String(form.get("contatoCargo") ?? ""),
          email: String(form.get("contatoEmail") ?? ""),
          telefone: String(form.get("contatoTelefone") ?? ""),
        },
      ],
      normas: Object.entries(sel).map(([normaId, s]) => ({
        normaId,
        periodicidade: s.periodicidade,
        customMeses: s.customMeses,
      })),
    };
    startTransition(async () => {
      const res = isEdit
        ? await updateClient(cliente!.id, payload)
        : await createClient(payload);
      if (res.ok) {
        toast.success(isEdit ? "Cliente atualizado." : "Cliente cadastrado.");
        onOpenChange(false);
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar cliente" : "Novo cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field id="razaoSocial" label="Razão social" error={errors.razaoSocial}>
              <Input id="razaoSocial" name="razaoSocial" defaultValue={cliente?.razaoSocial} autoFocus />
            </Field>
            <Field id="nomeFantasia" label="Nome fantasia">
              <Input id="nomeFantasia" name="nomeFantasia" defaultValue={cliente?.nomeFantasia ?? ""} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field id="cnpj" label="CNPJ" error={errors.cnpj}>
              <Input id="cnpj" name="cnpj" defaultValue={cliente?.cnpj} placeholder="00.000.000/0001-00" />
            </Field>
            <Field id="setor" label="Setor">
              <Input id="setor" name="setor" defaultValue={cliente?.setor ?? ""} />
            </Field>
            <Field label="Porte">
              <Select value={porte} onValueChange={setPorte}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {["Micro", "Pequeno", "Médio", "Grande"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field id="numColaboradores" label="Nº colaboradores">
              <Input id="numColaboradores" name="numColaboradores" type="number" min="0" defaultValue={cliente?.numColaboradores ?? ""} />
            </Field>
            <Field id="contractStart" label="Início do contrato" error={errors.contractStart}>
              <Input id="contractStart" name="contractStart" type="date" defaultValue={cliente?.contractStart} />
            </Field>
            <Field id="contractEnd" label="Fim do contrato" error={errors.contractEnd}>
              <Input id="contractEnd" name="contractEnd" type="date" defaultValue={cliente?.contractEnd} />
            </Field>
          </div>
          <Field id="contractValue" label="Valor do contrato (R$)">
            <Input id="contractValue" name="contractValue" type="number" step="0.01" min="0" defaultValue={cliente?.contractValue ?? ""} />
          </Field>

          <fieldset className="rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">Contato principal</legend>
            <div className="grid grid-cols-2 gap-3">
              <Field id="contatoNome" label="Nome" error={errors["contacts.0.nome"]}>
                <Input id="contatoNome" name="contatoNome" defaultValue={cliente?.contato.nome} />
              </Field>
              <Field id="contatoCargo" label="Cargo">
                <Input id="contatoCargo" name="contatoCargo" defaultValue={cliente?.contato.cargo} />
              </Field>
              <Field id="contatoEmail" label="E-mail">
                <Input id="contatoEmail" name="contatoEmail" type="email" defaultValue={cliente?.contato.email} />
              </Field>
              <Field id="contatoTelefone" label="Telefone">
                <Input id="contatoTelefone" name="contatoTelefone" defaultValue={cliente?.contato.telefone} />
              </Field>
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label>Normas contratadas e periodicidade</Label>
            <div className="space-y-2">
              {normas.map((n) => {
                const s = sel[n.id];
                return (
                  <div key={n.id} className="flex items-center gap-3 rounded-md border p-2">
                    <label className="flex flex-1 items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!s}
                        onChange={() => toggleNorma(n.id)}
                        className="size-4"
                      />
                      {n.codigo}
                    </label>
                    {s && (
                      <>
                        <Select
                          value={s.periodicidade}
                          onValueChange={(v) => setPeriodicidade(n.id, v)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PERIODICIDADE_LABEL).map(([v, l]) => (
                              <SelectItem key={v} value={v}>
                                {l}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {s.periodicidade === "CUSTOM" && (
                          <Input
                            type="number"
                            min="1"
                            placeholder="meses"
                            value={s.customMeses}
                            onChange={(e) => setCustom(n.id, e.target.value)}
                            className="w-24"
                          />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
