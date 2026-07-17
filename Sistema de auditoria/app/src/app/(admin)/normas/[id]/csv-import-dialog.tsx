"use client";

import { useMemo, useState, useTransition } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseControlesCsv } from "@/modules/normas/csv";
import { importControlesCsv } from "@/modules/normas/actions";

const EXEMPLO = `codigo,titulo,descricao,parent_codigo,processos_codigos
8,Operação,Controles de operação,,QUA
8.4,Compras,Controle de fornecedores externos,8,COM;TI`;

export function CsvImportDialog({
  open,
  onOpenChange,
  normaId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  normaId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [texto, setTexto] = useState("");

  const preview = useMemo(() => {
    try {
      return parseControlesCsv(texto);
    } catch {
      return [];
    }
  }, [texto]);

  function handleImport() {
    startTransition(async () => {
      const res = await importControlesCsv(normaId, texto);
      if (res.ok) {
        toast.success(
          `Importação concluída: ${res.criados ?? 0} criados, ${res.atualizados ?? 0} atualizados.`,
        );
        setTexto("");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar controles via CSV</DialogTitle>
          <DialogDescription>
            Colunas: <code>codigo, titulo, descricao, parent_codigo,
            processos_codigos</code> (processos separados por ponto-e-vírgula).
            Códigos já existentes são atualizados.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={8}
          placeholder={EXEMPLO}
          className="font-mono text-xs"
        />

        {preview.length > 0 && (
          <div className="max-h-60 overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Pai</TableHead>
                  <TableHead>Processos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((r, i) => (
                  <TableRow key={`${r.codigo}-${i}`}>
                    <TableCell className="font-mono">{r.codigo}</TableCell>
                    <TableCell>{r.titulo}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {r.parentCodigo ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.processosCodigos.join(", ") || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <span className="mr-auto self-center text-sm text-muted-foreground">
            {preview.length} linha(s) detectada(s)
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={pending || preview.length === 0}
          >
            {pending ? "Importando..." : `Importar ${preview.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
