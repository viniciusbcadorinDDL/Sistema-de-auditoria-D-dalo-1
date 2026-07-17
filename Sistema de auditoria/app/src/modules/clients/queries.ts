import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function listClients(filters?: {
  search?: string;
  incluirArquivados?: boolean;
}) {
  const where: Prisma.ClientWhereInput = {};
  if (!filters?.incluirArquivados) where.archived = false;
  if (filters?.search) {
    where.OR = [
      { razaoSocial: { contains: filters.search, mode: "insensitive" } },
      { nomeFantasia: { contains: filters.search, mode: "insensitive" } },
      { cnpj: { contains: filters.search } },
    ];
  }
  return db.client.findMany({
    where,
    orderBy: { razaoSocial: "asc" },
    include: {
      normas: { include: { norma: { select: { id: true, codigo: true } } } },
      _count: { select: { audits: true } },
    },
  });
}

export async function getClient(id: string) {
  return db.client.findUnique({
    where: { id },
    include: {
      normas: {
        include: { norma: { select: { id: true, codigo: true, nome: true } } },
      },
      audits: {
        orderBy: { dataInicio: "asc" },
        include: { norma: { select: { codigo: true } } },
      },
      _count: { select: { audits: true } },
    },
  });
}
