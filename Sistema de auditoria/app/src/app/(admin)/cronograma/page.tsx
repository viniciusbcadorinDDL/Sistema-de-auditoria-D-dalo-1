import Link from "next/link";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const STATUS_DOT: Record<string, string> = {
  PLANEJADA: "bg-sky-500",
  PLANO_PENDENTE: "bg-amber-500",
  EM_EXECUCAO: "bg-indigo-500",
  PENDENTE_RELATORIO: "bg-amber-600",
  CONCLUIDA: "bg-emerald-500",
  ATRASADA: "bg-red-500",
  CANCELADA: "bg-zinc-300",
};

export default async function CronogramaPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const sp = await searchParams;
  const year = Number(sp.year) || new Date().getFullYear();
  const inicio = new Date(year, 0, 1);
  const fim = new Date(year + 1, 0, 1);

  const [clients, audits] = await Promise.all([
    db.client.findMany({
      where: { archived: false },
      orderBy: { razaoSocial: "asc" },
      select: { id: true, razaoSocial: true, nomeFantasia: true },
    }),
    db.audit.findMany({
      where: { dataInicio: { gte: inicio, lt: fim } },
      select: {
        id: true,
        numero: true,
        clientId: true,
        status: true,
        dataInicio: true,
        norma: { select: { codigo: true } },
      },
    }),
  ]);

  // grid[clientId][mes] = audits
  const grid = new Map<string, Map<number, typeof audits>>();
  for (const a of audits) {
    const mes = a.dataInicio.getMonth();
    const porCliente = grid.get(a.clientId) ?? new Map();
    porCliente.set(mes, [...(porCliente.get(mes) ?? []), a]);
    grid.set(a.clientId, porCliente);
  }

  return (
    <>
      <PageHeader
        crumb="Operação"
        title="Cronograma"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/cronograma?year=${year - 1}`}>← {year - 1}</Link>
            </Button>
            <span className="px-2 font-semibold">{year}</span>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/cronograma?year=${year + 1}`}>{year + 1} →</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 bg-card p-3 text-left font-medium">
                  Cliente
                </th>
                {MESES.map((m) => (
                  <th key={m} className="p-2 text-center font-medium text-muted-foreground">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const linha = grid.get(c.id);
                return (
                  <tr key={c.id} className="border-b last:border-b-0">
                    <td className="sticky left-0 bg-card p-3 font-medium">
                      {c.nomeFantasia || c.razaoSocial}
                    </td>
                    {MESES.map((_, mes) => {
                      const items = linha?.get(mes) ?? [];
                      return (
                        <td key={mes} className="p-1.5 text-center align-top">
                          <div className="flex flex-col items-center gap-1">
                            {items.map((a) => (
                              <Link
                                key={a.id}
                                href={`/auditorias/${a.id}`}
                                title={`${a.numero} · ${a.norma.codigo}`}
                                className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px] hover:bg-accent"
                              >
                                <span
                                  className={`size-2 rounded-full ${STATUS_DOT[a.status] ?? "bg-zinc-400"}`}
                                />
                                {a.norma.codigo.replace("ISO ", "")}
                              </Link>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-muted-foreground">
                    Nenhum cliente ativo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
