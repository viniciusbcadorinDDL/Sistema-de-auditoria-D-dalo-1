"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORIA_LABEL } from "@/lib/labels";
import {
  ProcessoFormDialog,
  type ProcessoEdicao,
} from "./processo-form-dialog";

type ProcessoRow = {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  categoria: string;
  ativo: boolean;
  _count: { controles: number; audits: number };
};

export function ProcessosClient({ processos }: { processos: ProcessoRow[] }) {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessoEdicao | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return processos.filter((p) => {
      const matchSearch =
        !q ||
        p.codigo.toLowerCase().includes(q) ||
        p.nome.toLowerCase().includes(q);
      const matchCat = categoria === "ALL" || p.categoria === categoria;
      return matchSearch && matchCat;
    });
  }, [processos, search, categoria]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(p: ProcessoRow) {
    setEditing({
      id: p.id,
      codigo: p.codigo,
      nome: p.nome,
      descricao: p.descricao,
      categoria: p.categoria,
    });
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        crumb="Cadastros (Gestão)"
        title="Processos"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Novo Processo
          </Button>
        }
      />

      <div className="mb-4 rounded-md border border-brand/15 bg-brand/5 p-3 text-sm text-foreground">
        📌 <strong>Para que serve:</strong> os processos são o eixo pelo qual o
        auditor filtra a execução em campo. Ao auditar &quot;Gestão de RH&quot;,
        o checklist mostra apenas os controles dessa categoria — sem percorrer a
        norma inteira.
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Buscar processo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as categorias</SelectItem>
                {Object.entries(CATEGORIA_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Código</TableHead>
                <TableHead>Processo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Controles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold">{p.codigo}</TableCell>
                  <TableCell>
                    <Link
                      href={`/processos/${p.id}`}
                      className="hover:underline"
                    >
                      {p.nome}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {CATEGORIA_LABEL[
                        p.categoria as keyof typeof CATEGORIA_LABEL
                      ] ?? p.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p._count.controles} controles
                  </TableCell>
                  <TableCell>
                    {p.ativo ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(p)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Nenhum processo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProcessoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        processo={editing}
      />
    </>
  );
}
