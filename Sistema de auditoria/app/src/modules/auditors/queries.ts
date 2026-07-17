import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function listAuditors(filters?: {
  search?: string;
  normaId?: string;
  status?: "ATIVOS" | "INATIVOS";
}) {
  const where: Prisma.AuditorWhereInput = {};
  if (filters?.search) {
    where.OR = [
      { user: { name: { contains: filters.search, mode: "insensitive" } } },
      { user: { email: { contains: filters.search, mode: "insensitive" } } },
      { cpf: { contains: filters.search } },
    ];
  }
  if (filters?.normaId) {
    where.normas = { some: { id: filters.normaId } };
  }
  if (filters?.status === "ATIVOS") where.user = { is: { active: true } };
  if (filters?.status === "INATIVOS") where.user = { is: { active: false } };

  return db.auditor.findMany({
    where,
    orderBy: { user: { name: "asc" } },
    include: {
      user: { select: { name: true, email: true, active: true } },
      normas: { select: { id: true, codigo: true } },
      _count: { select: { certificates: true } },
    },
  });
}

export async function getAuditor(id: string) {
  return db.auditor.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, active: true } },
      normas: { select: { id: true, codigo: true, nome: true } },
      certificates: {
        orderBy: { expiresAt: "asc" },
        include: { norma: { select: { codigo: true } } },
      },
    },
  });
}

/** Auditores qualificados para uma norma e (futuramente) disponíveis no período. */
export async function getAvailableAuditors(
  normaId: string,
  _dataInicio?: Date,
  _dataFim?: Date,
) {
  return db.auditor.findMany({
    where: {
      user: { active: true },
      normas: { some: { id: normaId } },
    },
    orderBy: { user: { name: "asc" } },
    include: {
      user: { select: { id: true, name: true } },
      certificates: {
        where: { normaId },
        orderBy: { expiresAt: "desc" },
        take: 1,
      },
    },
  });
}
