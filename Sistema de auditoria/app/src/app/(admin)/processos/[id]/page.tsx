import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProcesso } from "@/modules/processos/queries";
import { CATEGORIA_LABEL } from "@/lib/labels";
import { ProcessoDetailActions } from "./processo-detail-actions";

export const dynamic = "force-dynamic";

export default async function ProcessoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const processo = await getProcesso(id);
  if (!processo) notFound();

  // Agrupa controles por norma.
  const porNorma = new Map<
    string,
    { codigo: string; nome: string; controles: typeof processo.controles }
  >();
  for (const c of processo.controles) {
    const grupo = porNorma.get(c.norma.id) ?? {
      codigo: c.norma.codigo,
      nome: c.norma.nome,
      controles: [],
    };
    grupo.controles.push(c);
    porNorma.set(c.norma.id, grupo);
  }

  const podeExcluir =
    processo._count.controles === 0 && processo._count.audits === 0;

  return (
    <>
      <PageHeader
        crumb={
          <span>
            <Link href="/processos" className="hover:underline">
              Processos
            </Link>{" "}
            / {processo.codigo}
          </span>
        }
        title={processo.nome}
        actions={
          <ProcessoDetailActions
            id={processo.id}
            ativo={processo.ativo}
            podeExcluir={podeExcluir}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="Código" value={processo.codigo} />
            <Info
              label="Categoria"
              value={
                CATEGORIA_LABEL[processo.categoria] ?? processo.categoria
              }
            />
            <Info
              label="Status"
              value={processo.ativo ? "Ativo" : "Inativo"}
            />
            <div>
              <div className="text-muted-foreground">Descrição</div>
              <div>{processo.descricao ?? "—"}</div>
            </div>
            <div className="flex gap-6 pt-2">
              <Metric value={processo._count.controles} label="Controles" />
              <Metric
                value={porNorma.size}
                label={porNorma.size === 1 ? "Norma" : "Normas"}
              />
              <Metric value={processo._count.audits} label="Auditorias" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Controles que referenciam este processo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {porNorma.size === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum controle vinculado ainda.
              </p>
            )}
            {[...porNorma.values()].map((g) => (
              <div key={g.codigo}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{g.codigo}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {g.controles.length} controle(s)
                  </span>
                </div>
                <ul className="space-y-1 text-sm">
                  {g.controles.map((c) => (
                    <li key={c.id} className="flex gap-2">
                      <span className="font-mono text-muted-foreground">
                        {c.codigo}
                      </span>
                      <span>{c.titulo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {processo.audits.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Auditorias em andamento que usam este processo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {processo.audits.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="font-mono">{a.numero}</span>
                  <span>{a.client.razaoSocial}</span>
                  <Badge variant="secondary">{a.norma.codigo}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-brand">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
