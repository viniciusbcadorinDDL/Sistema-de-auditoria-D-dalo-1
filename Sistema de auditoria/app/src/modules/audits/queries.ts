import { type AuditStatus } from "@prisma/client";
import { db } from "@/lib/db";

export async function listAudits(status?: AuditStatus) {
  return db.audit.findMany({
    where: status ? { status } : undefined,
    orderBy: { dataInicio: "desc" },
    include: {
      client: { select: { razaoSocial: true, nomeFantasia: true } },
      norma: { select: { codigo: true } },
      leader: { select: { name: true } },
      _count: { select: { checklist: true } },
    },
  });
}

export async function getAudit(id: string) {
  return db.audit.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, razaoSocial: true, nomeFantasia: true } },
      norma: { select: { id: true, codigo: true, nome: true } },
      leader: { select: { id: true, name: true, email: true } },
      support: { select: { id: true, name: true } },
      processos: { select: { id: true, codigo: true, nome: true } },
      plan: true,
      report: true,
      checklist: {
        orderBy: { controleCodigo: "asc" },
        select: {
          id: true,
          controleCodigo: true,
          controleTitulo: true,
          classification: true,
        },
      },
      _count: { select: { checklist: true } },
    },
  });
}

/** Conta auditorias do ano para gerar o número sequencial AAAA-NNN. */
export async function nextAuditNumber(year: number): Promise<string> {
  const count = await db.audit.count({
    where: { numero: { startsWith: `${year}-` } },
  });
  return `${year}-${String(count + 1).padStart(3, "0")}`;
}

/**
 * Dados para o formulário "Nova Auditoria": clientes (com suas normas),
 * e por norma os processos disponíveis e os auditores qualificados.
 */
export async function getAllocationData() {
  const [clients, normas] = await Promise.all([
    db.client.findMany({
      where: { archived: false },
      orderBy: { razaoSocial: "asc" },
      select: {
        id: true,
        razaoSocial: true,
        nomeFantasia: true,
        normas: { select: { norma: { select: { id: true, codigo: true } } } },
      },
    }),
    db.norma.findMany({
      where: { status: "ATIVA" },
      orderBy: { codigo: "asc" },
      select: { id: true, codigo: true },
    }),
  ]);

  const processosByNorma: Record<
    string,
    { id: string; codigo: string; nome: string }[]
  > = {};
  const auditorsByNorma: Record<
    string,
    { userId: string; name: string; certExpiresAt: string | null }[]
  > = {};

  for (const n of normas) {
    const [processos, auditors] = await Promise.all([
      db.processo.findMany({
        where: { ativo: true, controles: { some: { normaId: n.id } } },
        orderBy: { codigo: "asc" },
        select: { id: true, codigo: true, nome: true },
      }),
      db.auditor.findMany({
        where: { user: { is: { active: true } }, normas: { some: { id: n.id } } },
        orderBy: { user: { name: "asc" } },
        select: {
          user: { select: { id: true, name: true } },
          certificates: {
            where: { normaId: n.id },
            orderBy: { expiresAt: "desc" },
            take: 1,
            select: { expiresAt: true },
          },
        },
      }),
    ]);
    processosByNorma[n.id] = processos;
    auditorsByNorma[n.id] = auditors.map((a) => ({
      userId: a.user.id,
      name: a.user.name,
      certExpiresAt: a.certificates[0]?.expiresAt.toISOString() ?? null,
    }));
  }

  return {
    clients: clients.map((c) => ({
      id: c.id,
      razaoSocial: c.razaoSocial,
      nomeFantasia: c.nomeFantasia,
      normas: c.normas.map((cn) => cn.norma),
    })),
    normas,
    processosByNorma,
    auditorsByNorma,
  };
}
