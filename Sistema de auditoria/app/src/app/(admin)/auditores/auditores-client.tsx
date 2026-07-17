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
import {
  AuditorFormDialog,
  type AuditorEdicao,
  type NormaOpcao,
} from "./auditor-form-dialog";

export type AuditorRow = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  cpf: string;
  cnpj: string | null;
  phone: string | null;
  dailyRate: string | null;
  normas: { id: string; codigo: string }[];
  certCount: number;
};

export function AuditoresClient({
  auditores,
  normas,
}: {
  auditores: AuditorRow[];
  normas: NormaOpcao[];
}) {
  const [search, setSearch] = useState("");
  const [normaId, setNormaId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AuditorEdicao | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditores.filter((a) => {
      const mSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.cpf.includes(q);
      const mNorma = normaId === "ALL" || a.normas.some((n) => n.id === normaId);
      const mStatus =
        status === "ALL" ||
        (status === "ATIVOS" ? a.active : !a.active);
      return mSearch && mNorma && mStatus;
    });
  }, [auditores, search, normaId, status]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(a: AuditorRow) {
    setEditing({
      id: a.id,
      name: a.name,
      email: a.email,
      cpf: a.cpf,
      cnpj: a.cnpj,
      phone: a.phone,
      dailyRate: a.dailyRate,
      normaIds: a.normas.map((n) => n.id),
    });
    setOpen(true);
  }

  return (
    <>
      <PageHeader
        crumb="Cadastros (Gestão)"
        title="Auditores"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Novo Auditor
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Buscar por nome, e-mail ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={normaId} onValueChange={setNormaId}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as normas</SelectItem>
                {normas.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.codigo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ATIVOS">Ativos</SelectItem>
                <SelectItem value="INATIVOS">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Normas</TableHead>
                <TableHead>Certificados</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    <Link href={`/auditores/${a.id}`} className="hover:underline">
                      {a.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {a.normas.map((n) => (
                        <Badge key={n.id} variant="secondary">
                          {n.codigo}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{a.certCount}</TableCell>
                  <TableCell>
                    {a.active ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600">Ativo</Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhum auditor encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AuditorFormDialog
        open={open}
        onOpenChange={setOpen}
        auditor={editing}
        normas={normas}
      />
    </>
  );
}
