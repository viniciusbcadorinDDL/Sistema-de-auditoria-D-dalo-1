"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AuditorFormDialog,
  type AuditorEdicao,
  type NormaOpcao,
} from "../auditor-form-dialog";
import {
  deleteCertificate,
  setAuditorActive,
  uploadCertificate,
} from "@/modules/auditors/actions";

type Cert = {
  id: string;
  type: string;
  issuer: string;
  issuedAt: string;
  expiresAt: string;
  fileUrl: string;
  normaCodigo: string | null;
};

type AuditorDetail = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  cpf: string;
  cnpj: string | null;
  phone: string | null;
  dailyRate: string | null;
  normas: { id: string; codigo: string; nome: string }[];
};

const NENHUMA = "__none__";

function vigencia(expiresAt: string): {
  label: string;
  className: string;
} {
  const dias = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / 86_400_000,
  );
  if (dias < 0)
    return { label: "Vencido", className: "bg-red-600 hover:bg-red-600" };
  if (dias <= 30)
    return {
      label: `Vence em ${dias}d`,
      className: "bg-amber-500 hover:bg-amber-500",
    };
  return {
    label: "Vigente",
    className: "bg-emerald-600 hover:bg-emerald-600",
  };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function AuditorDetailClient({
  auditor,
  certs,
  normas,
}: {
  auditor: AuditorDetail;
  certs: Cert[];
  normas: NormaOpcao[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  const edicao: AuditorEdicao = {
    id: auditor.id,
    name: auditor.name,
    email: auditor.email,
    cpf: auditor.cpf,
    cnpj: auditor.cnpj,
    phone: auditor.phone,
    dailyRate: auditor.dailyRate,
    normaIds: auditor.normas.map((n) => n.id),
  };

  function toggleActive() {
    startTransition(async () => {
      const res = await setAuditorActive(auditor.id, !auditor.active);
      if (res.ok) {
        toast.success(auditor.active ? "Auditor inativado." : "Auditor reativado.");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  function excluirCert(id: string) {
    if (!confirm("Excluir este certificado?")) return;
    startTransition(async () => {
      const res = await deleteCertificate(id);
      if (res.ok) {
        toast.success("Certificado excluído.");
        router.refresh();
      } else toast.error(res.error);
    });
  }

  return (
    <>
      <PageHeader
        crumb={
          <span>
            <Link href="/auditores" className="hover:underline">
              Auditores
            </Link>{" "}
            / {auditor.name}
          </span>
        }
        title={auditor.name}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleActive} disabled={pending}>
              {auditor.active ? "Inativar" : "Reativar"}
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Linha label="E-mail" value={auditor.email} />
            <Linha label="CPF" value={auditor.cpf} />
            <Linha label="CNPJ" value={auditor.cnpj ?? "—"} />
            <Linha label="Telefone" value={auditor.phone ?? "—"} />
            <Linha
              label="Diária"
              value={
                auditor.dailyRate
                  ? `R$ ${Number(auditor.dailyRate).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : "—"
              }
            />
            <Linha label="Status" value={auditor.active ? "Ativo" : "Inativo"} />
            <div className="pt-1">
              <div className="mb-1 text-muted-foreground">Normas habilitadas</div>
              <div className="flex flex-wrap gap-1">
                {auditor.normas.map((n) => (
                  <Badge key={n.id} variant="secondary" title={n.nome}>
                    {n.codigo}
                  </Badge>
                ))}
                {auditor.normas.length === 0 && <span>—</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Certificados</CardTitle>
            <Button size="sm" onClick={() => setCertOpen(true)}>
              <Plus className="size-4" />
              Adicionar
            </Button>
          </CardHeader>
          <CardContent>
            {certs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum certificado cadastrado.
              </p>
            ) : (
              <ul className="divide-y">
                {certs.map((c) => {
                  const v = vigencia(c.expiresAt);
                  return (
                    <li key={c.id} className="flex items-center gap-3 py-2.5">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {c.type}
                          {c.normaCodigo && (
                            <Badge variant="outline" className="ml-2">
                              {c.normaCodigo}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {c.issuer} · emissão {fmtDate(c.issuedAt)} · validade{" "}
                          {fmtDate(c.expiresAt)}
                        </div>
                      </div>
                      <Badge className={v.className}>{v.label}</Badge>
                      <a
                        href={c.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand hover:underline"
                      >
                        Ver
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => excluirCert(c.id)}
                        disabled={pending}
                      >
                        Excluir
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <AuditorFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        auditor={edicao}
        normas={normas}
      />
      <AddCertDialog
        open={certOpen}
        onOpenChange={setCertOpen}
        auditorId={auditor.id}
        normas={auditor.normas}
      />
    </>
  );
}

function AddCertDialog({
  open,
  onOpenChange,
  auditorId,
  normas,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditorId: string;
  normas: { id: string; codigo: string }[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [normaId, setNormaId] = useState(NENHUMA);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("normaId", normaId === NENHUMA ? "" : normaId);
    startTransition(async () => {
      const res = await uploadCertificate(auditorId, fd);
      if (res.ok) {
        toast.success("Certificado adicionado.");
        formRef.current?.reset();
        setNormaId(NENHUMA);
        onOpenChange(false);
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar certificado</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="type">Tipo</Label>
            <Input id="type" name="type" placeholder="Auditor Líder ISO 9001" />
            {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issuer">Emissor</Label>
            <Input id="issuer" name="issuer" placeholder="Exemplar / IRCA" />
            {errors.issuer && <p className="text-xs text-destructive">{errors.issuer}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="issuedAt">Emissão</Label>
              <Input id="issuedAt" name="issuedAt" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Validade</Label>
              <Input id="expiresAt" name="expiresAt" type="date" />
              {errors.expiresAt && (
                <p className="text-xs text-destructive">{errors.expiresAt}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="normaId">Norma (opcional)</Label>
            <Select value={normaId} onValueChange={setNormaId}>
              <SelectTrigger id="normaId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NENHUMA}>Nenhuma</SelectItem>
                {normas.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.codigo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="file">Arquivo (PDF/imagem)</Label>
            <Input id="file" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Linha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
