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
import { cn } from "@/lib/utils";
import { createAuditor, updateAuditor } from "@/modules/auditors/actions";

export type NormaOpcao = { id: string; codigo: string };
export type AuditorEdicao = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  cnpj: string | null;
  phone: string | null;
  dailyRate: string | null;
  normaIds: string[];
};

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AuditorFormDialog({
  open,
  onOpenChange,
  auditor,
  normas,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditor: AuditorEdicao | null;
  normas: NormaOpcao[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selNormas, setSelNormas] = useState<Set<string>>(new Set());
  const isEdit = !!auditor;

  useEffect(() => {
    if (open) {
      setFieldErrors({});
      setSelNormas(new Set(auditor?.normaIds ?? []));
    }
  }, [open, auditor]);

  function toggleNorma(id: string) {
    setSelNormas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      cpf: String(form.get("cpf") ?? ""),
      cnpj: String(form.get("cnpj") ?? ""),
      phone: String(form.get("phone") ?? ""),
      dailyRate: String(form.get("dailyRate") ?? ""),
      normaIds: [...selNormas],
    };
    startTransition(async () => {
      const res = isEdit
        ? await updateAuditor(auditor!.id, payload)
        : await createAuditor(payload);
      if (res.ok) {
        toast.success(isEdit ? "Auditor atualizado." : "Auditor cadastrado.");
        onOpenChange(false);
        router.refresh();
      } else {
        setFieldErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar auditor" : "Novo auditor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field id="name" label="Nome completo" error={fieldErrors.name}>
            <Input id="name" name="name" defaultValue={auditor?.name} autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="email" label="E-mail" error={fieldErrors.email}>
              <Input id="email" name="email" type="email" defaultValue={auditor?.email} />
            </Field>
            <Field id="phone" label="Telefone">
              <Input id="phone" name="phone" defaultValue={auditor?.phone ?? ""} placeholder="(11) 90000-0000" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field id="cpf" label="CPF" error={fieldErrors.cpf}>
              <Input id="cpf" name="cpf" defaultValue={auditor?.cpf} placeholder="000.000.000-00" />
            </Field>
            <Field id="cnpj" label="CNPJ (opcional)" error={fieldErrors.cnpj}>
              <Input id="cnpj" name="cnpj" defaultValue={auditor?.cnpj ?? ""} />
            </Field>
            <Field id="dailyRate" label="Diária (R$)" error={fieldErrors.dailyRate}>
              <Input id="dailyRate" name="dailyRate" type="number" step="0.01" min="0" defaultValue={auditor?.dailyRate ?? ""} />
            </Field>
          </div>
          <div className="space-y-1.5">
            <Label>Normas habilitadas</Label>
            <div className="flex flex-wrap gap-2">
              {normas.map((n) => {
                const on = selNormas.has(n.id);
                return (
                  <button
                    type="button"
                    key={n.id}
                    onClick={() => toggleNorma(n.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      on
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {n.codigo}
                  </button>
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
