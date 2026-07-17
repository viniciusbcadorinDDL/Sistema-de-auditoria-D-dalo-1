import Link from "next/link";
import { PageHeader } from "@/components/domain/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KPIS: { href: string; label: string; get: () => Promise<number> }[] = [
  { href: "/auditores", label: "Auditores", get: () => db.auditor.count() },
  { href: "/clientes", label: "Clientes", get: () => db.client.count({ where: { archived: false } }) },
  { href: "/normas", label: "Normas", get: () => db.norma.count() },
  { href: "/processos", label: "Processos", get: () => db.processo.count({ where: { ativo: true } }) },
];

export default async function DashboardPage() {
  const valores = await Promise.all(KPIS.map((k) => k.get()));

  return (
    <>
      <PageHeader crumb="Visão geral" title="Dashboard" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {KPIS.map((kpi, i) => (
          <Link key={kpi.href} href={kpi.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="px-5">
                <div className="text-3xl font-bold text-brand">{valores[i]}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {kpi.label}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Dashboard completo (KPIs do mês, alertas e ocupação) será implementado
        no Sprint 4. Use o menu lateral para acessar os cadastros.
      </p>
    </>
  );
}
