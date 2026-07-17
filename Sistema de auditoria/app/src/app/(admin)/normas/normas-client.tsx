"use client";

import { useState } from "react";
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
import { NORMA_STATUS_LABEL } from "@/lib/labels";
import { NormaFormDialog, type NormaEdicao } from "./norma-form-dialog";

type NormaRow = {
  id: string;
  codigo: string;
  nome: string;
  versao: string;
  familia: string | null;
  status: string;
  _count: { controles: number; audits: number; clientNormas: number };
};

const STATUS_STYLE: Record<string, string> = {
  ATIVA: "bg-emerald-600 hover:bg-emerald-600",
  EM_REVISAO: "bg-amber-500 hover:bg-amber-500",
  DESCONTINUADA: "",
};

export function NormasClient({ normas }: { normas: NormaRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NormaEdicao | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(n: NormaRow) {
    setEditing({
      id: n.id,
      codigo: n.codigo,
      nome: n.nome,
      versao: n.versao,
      familia: n.familia,
      status: n.status,
    });
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        crumb="Cadastros (Gestão)"
        title="Normas & Controles"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nova Norma
          </Button>
        }
      />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Controles</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {normas.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-semibold">
                    <Link href={`/normas/${n.id}`} className="hover:underline">
                      {n.codigo}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">
                    {n.nome}
                  </TableCell>
                  <TableCell>{n._count.controles}</TableCell>
                  <TableCell>{n._count.clientNormas}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLE[n.status]} variant={n.status === "DESCONTINUADA" ? "outline" : "default"}>
                      {NORMA_STATUS_LABEL[n.status as keyof typeof NORMA_STATUS_LABEL] ?? n.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(n)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {normas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhuma norma cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NormaFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        norma={editing}
      />
    </>
  );
}
