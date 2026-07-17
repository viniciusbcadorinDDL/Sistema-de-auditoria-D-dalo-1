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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createControle, updateControle } from "@/modules/normas/actions";

export type ProcessoOpcao = { id: string; codigo: string; nome: string };
export type ControleOpcao = { id: string; codigo: string; titulo: string };
export type ControleEdicao = {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  parentId: string | null;
  ativo: boolean;
  processoIds: string[];
};

const NENHUM = "__none__";

export function ControleFormDialog({
  open,
  onOpenChange,
  normaId,
  controle,
  processos,
  controlesPai,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  normaId: string;
  controle: ControleEdicao | null;
  processos: ProcessoOpcao[];
  controlesPai: ControleOpcao[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [parentId, setParentId] = useState<string>(NENHUM);
  const [selProc, setSelProc] = useState<Set<string>>(new Set());
  const isEdit = !!controle;

  useEffect(() => {
    if (open) {
      setFieldErrors({});
      setParentId(controle?.parentId ?? NENHUM);
      setSelProc(new Set(controle?.processoIds ?? []));
    }
  }, [open, controle]);

  function toggleProc(id: string) {
    setSelProc((prev) => {
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
      codigo: String(form.get("codigo") ?? ""),
      titulo: String(form.get("titulo") ?? ""),
      descricao: String(form.get("descricao") ?? ""),
      parentId: parentId === NENHUM ? null : parentId,
      ativo: true,
      processoIds: [...selProc],
    };
    startTransition(async () => {
      const res = isEdit
        ? await updateControle(controle!.id, payload)
        : await createControle(normaId, payload);
      if (res.ok) {
        toast.success(isEdit ? "Controle atualizado." : "Controle criado.");
        onOpenChange(false);
        router.refresh();
      } else {
        setFieldErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }

  const opcoesPai = controlesPai.filter((c) => c.id !== controle?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar controle" : "Novo controle"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                name="codigo"
                defaultValue={controle?.codigo}
                placeholder="7.2"
                autoFocus
              />
              {fieldErrors.codigo && (
                <p className="text-xs text-destructive">{fieldErrors.codigo}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                defaultValue={controle?.titulo}
                placeholder="Competência"
              />
              {fieldErrors.titulo && (
                <p className="text-xs text-destructive">{fieldErrors.titulo}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              defaultValue={controle?.descricao ?? ""}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="parent">Controle pai (opcional)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger id="parent" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NENHUM}>Nenhum (controle raiz)</SelectItem>
                {opcoesPai.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.codigo} — {c.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Processos vinculados</Label>
            <div className="flex flex-wrap gap-2">
              {processos.map((p) => {
                const on = selProc.has(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => toggleProc(p.id)}
                    title={p.nome}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      on
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-background text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {p.codigo}
                  </button>
                );
              })}
              {processos.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  Cadastre processos primeiro.
                </span>
              )}
            </div>
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
