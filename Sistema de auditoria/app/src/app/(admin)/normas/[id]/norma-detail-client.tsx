"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Upload, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NORMA_STATUS_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import {
  deleteControle,
  toggleControleAtivo,
} from "@/modules/normas/actions";
import {
  ControleFormDialog,
  type ControleEdicao,
  type ControleOpcao,
  type ProcessoOpcao,
} from "./controle-form-dialog";
import { CsvImportDialog } from "./csv-import-dialog";

export type ControleNode = {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  parentId: string | null;
  ativo: boolean;
  ordem: number;
  processos: ProcessoOpcao[];
  _count: { checklistItems: number; children: number };
};

type NormaInfo = {
  id: string;
  codigo: string;
  nome: string;
  versao: string;
  familia: string | null;
  status: string;
};

export function NormaDetailClient({
  norma,
  controles,
  processos,
}: {
  norma: NormaInfo;
  controles: ControleNode[];
  processos: ProcessoOpcao[];
}) {
  const [ctrlDialog, setCtrlDialog] = useState(false);
  const [csvDialog, setCsvDialog] = useState(false);
  const [editing, setEditing] = useState<ControleEdicao | null>(null);

  const raizes = controles.filter((c) => !c.parentId);
  const filhosDe = (id: string) => controles.filter((c) => c.parentId === id);
  const opcoesPai: ControleOpcao[] = controles.map((c) => ({
    id: c.id,
    codigo: c.codigo,
    titulo: c.titulo,
  }));

  function abrirNovo() {
    setEditing(null);
    setCtrlDialog(true);
  }
  function abrirEdicao(c: ControleNode) {
    setEditing({
      id: c.id,
      codigo: c.codigo,
      titulo: c.titulo,
      descricao: c.descricao,
      parentId: c.parentId,
      ativo: c.ativo,
      processoIds: c.processos.map((p) => p.id),
    });
    setCtrlDialog(true);
  }

  return (
    <>
      <PageHeader
        crumb={
          <span>
            <Link href="/normas" className="hover:underline">
              Normas
            </Link>{" "}
            / {norma.codigo}
          </span>
        }
        title={norma.nome}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCsvDialog(true)}>
              <Upload className="size-4" />
              Importar CSV
            </Button>
            <Button onClick={abrirNovo}>
              <Plus className="size-4" />
              Adicionar controle
            </Button>
          </div>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-x-10 gap-y-3 text-sm">
          <Info label="Código" value={norma.codigo} />
          <Info label="Versão" value={norma.versao} />
          <Info label="Família" value={norma.familia ?? "—"} />
          <div>
            <div className="text-muted-foreground">Status</div>
            <Badge variant={norma.status === "ATIVA" ? "default" : "outline"}>
              {NORMA_STATUS_LABEL[norma.status as keyof typeof NORMA_STATUS_LABEL] ?? norma.status}
            </Badge>
          </div>
          <Info label="Controles" value={String(controles.length)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Controles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {raizes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum controle. Adicione manualmente ou importe via CSV.
            </p>
          )}
          {raizes.map((raiz) => (
            <div key={raiz.id}>
              <ControleRow c={raiz} onEdit={abrirEdicao} />
              <div className="ml-6 border-l pl-3">
                {filhosDe(raiz.id).map((f) => (
                  <ControleRow key={f.id} c={f} onEdit={abrirEdicao} />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ControleFormDialog
        open={ctrlDialog}
        onOpenChange={setCtrlDialog}
        normaId={norma.id}
        controle={editing}
        processos={processos}
        controlesPai={opcoesPai}
      />
      <CsvImportDialog
        open={csvDialog}
        onOpenChange={setCsvDialog}
        normaId={norma.id}
      />
    </>
  );
}

function ControleRow({
  c,
  onEdit,
}: {
  c: ControleNode;
  onEdit: (c: ControleNode) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const res = await toggleControleAtivo(c.id, !c.ativo);
      if (res.ok) {
        toast.success(c.ativo ? "Controle inativado." : "Controle reativado.");
        router.refresh();
      } else toast.error(res.error);
    });
  }
  function excluir() {
    if (!confirm(`Excluir o controle ${c.codigo}?`)) return;
    startTransition(async () => {
      const res = await deleteControle(c.id);
      if (res.ok) {
        toast.success("Controle excluído.");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b py-2 last:border-b-0",
        !c.ativo && "opacity-50",
      )}
    >
      <span className="w-16 shrink-0 font-mono text-sm text-muted-foreground">
        {c.codigo}
      </span>
      <span className="flex-1 text-sm">{c.titulo}</span>
      <div className="flex flex-wrap gap-1">
        {c.processos.map((p) => (
          <Badge key={p.id} variant="secondary" title={p.nome}>
            {p.codigo}
          </Badge>
        ))}
      </div>
      {!c.ativo && <Badge variant="outline">Inativo</Badge>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={pending}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(c)}>Editar</DropdownMenuItem>
          <DropdownMenuItem onClick={toggle}>
            {c.ativo ? "Inativar" : "Reativar"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={excluir}
            className="text-destructive focus:text-destructive"
          >
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
