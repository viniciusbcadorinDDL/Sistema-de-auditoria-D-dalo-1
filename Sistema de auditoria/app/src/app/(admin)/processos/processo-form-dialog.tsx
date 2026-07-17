"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { CATEGORIA_LABEL } from "@/lib/labels";
import { createProcesso, updateProcesso } from "@/modules/processos/actions";

export type ProcessoEdicao = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  categoria: string;
};

export function ProcessoFormDialog({
  open,
  onOpenChange,
  processo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processo: ProcessoEdicao | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [categoria, setCategoria] = useState<string>("OPERACIONAL");

  const isEdit = !!processo;

  useEffect(() => {
    if (open) {
      setFieldErrors({});
      setCategoria(processo?.categoria ?? "OPERACIONAL");
    }
  }, [open, processo]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      codigo: String(form.get("codigo") ?? ""),
      nome: String(form.get("nome") ?? ""),
      descricao: String(form.get("descricao") ?? ""),
      categoria,
    };

    startTransition(async () => {
      const res = isEdit
        ? await updateProcesso(processo!.id, payload)
        : await createProcesso(payload);

      if (res.ok) {
        toast.success(isEdit ? "Processo atualizado." : "Processo criado.");
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
          <DialogTitle>{isEdit ? "Editar processo" : "Novo processo"}</DialogTitle>
          <DialogDescription>
            Processos categorizam os controles e filtram a execução em campo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                name="codigo"
                defaultValue={processo?.codigo}
                placeholder="RH"
                maxLength={10}
                autoFocus
                className="uppercase"
              />
              {fieldErrors.codigo && (
                <p className="text-xs text-destructive">{fieldErrors.codigo}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                defaultValue={processo?.nome}
                placeholder="Gestão de Recursos Humanos"
              />
              {fieldErrors.nome && (
                <p className="text-xs text-destructive">{fieldErrors.nome}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoria">Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger id="categoria" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIA_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              name="descricao"
              defaultValue={processo?.descricao ?? ""}
              rows={3}
              placeholder="Breve descrição do processo..."
            />
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
