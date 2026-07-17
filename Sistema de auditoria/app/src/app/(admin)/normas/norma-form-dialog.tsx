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
import { NORMA_STATUS_LABEL } from "@/lib/labels";
import { createNorma, updateNorma } from "@/modules/normas/actions";

export type NormaEdicao = {
  id: string;
  codigo: string;
  nome: string;
  versao: string;
  familia: string | null;
  status: string;
};

export function NormaFormDialog({
  open,
  onOpenChange,
  norma,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  norma: NormaEdicao | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("ATIVA");
  const isEdit = !!norma;

  useEffect(() => {
    if (open) {
      setFieldErrors({});
      setStatus(norma?.status ?? "ATIVA");
    }
  }, [open, norma]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      codigo: String(form.get("codigo") ?? ""),
      nome: String(form.get("nome") ?? ""),
      versao: String(form.get("versao") ?? ""),
      familia: String(form.get("familia") ?? ""),
      status,
    };
    startTransition(async () => {
      const res = isEdit
        ? await updateNorma(norma!.id, payload)
        : await createNorma(payload);
      if (res.ok) {
        toast.success(isEdit ? "Norma atualizada." : "Norma criada.");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar norma" : "Nova norma"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              name="codigo"
              defaultValue={norma?.codigo}
              placeholder="ISO 9001:2015"
              autoFocus
            />
            {fieldErrors.codigo && (
              <p className="text-xs text-destructive">{fieldErrors.codigo}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="nome"
              defaultValue={norma?.nome}
              placeholder="Sistemas de gestão da qualidade — Requisitos"
            />
            {fieldErrors.nome && (
              <p className="text-xs text-destructive">{fieldErrors.nome}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="versao">Versão</Label>
              <Input
                id="versao"
                name="versao"
                defaultValue={norma?.versao}
                placeholder="2015"
              />
              {fieldErrors.versao && (
                <p className="text-xs text-destructive">{fieldErrors.versao}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="familia">Família (opcional)</Label>
              <Input
                id="familia"
                name="familia"
                defaultValue={norma?.familia ?? ""}
                placeholder="ISO 9000"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NORMA_STATUS_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
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
