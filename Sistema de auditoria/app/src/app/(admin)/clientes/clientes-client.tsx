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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ClientFormDialog,
  type ClienteEdicao,
  type NormaOpcao,
} from "./client-form-dialog";

export type ClientRow = ClienteEdicao & {
  archived: boolean;
  auditsCount: number;
  normaCodigos: string[];
};

export function ClientesClient({
  clientes,
  normas,
}: {
  clientes: ClientRow[];
  normas: NormaOpcao[];
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClienteEdicao | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        c.razaoSocial.toLowerCase().includes(q) ||
        (c.nomeFantasia ?? "").toLowerCase().includes(q) ||
        c.cnpj.includes(q),
    );
  }, [clientes, search]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(c: ClientRow) {
    setEditing(c);
    setOpen(true);
  }

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        crumb="Cadastros (Gestão)"
        title="Clientes"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Novo Cliente
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <Input
            placeholder="Buscar por razão social, fantasia ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Normas</TableHead>
                <TableHead>Contrato até</TableHead>
                <TableHead>Auditorias</TableHead>
                <TableHead className="w-20 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const vencido = c.contractEnd < hoje;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/clientes/${c.id}`} className="hover:underline">
                        {c.nomeFantasia || c.razaoSocial}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.cnpj}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {c.normaCodigos.map((cod) => (
                          <Badge key={cod} variant="secondary">
                            {cod}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={vencido ? "text-destructive" : ""}>
                        {new Date(c.contractEnd).toLocaleDateString("pt-BR")}
                      </span>
                    </TableCell>
                    <TableCell>{c.auditsCount}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientFormDialog
        open={open}
        onOpenChange={setOpen}
        cliente={editing}
        normas={normas}
      />
    </>
  );
}
