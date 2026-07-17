import { Prisma, type ProcessoCategoria } from "@prisma/client";
import { db } from "@/lib/db";

export type ProcessoListItem = Awaited<
  ReturnType<typeof listProcessos>
>[number];

export async function listProcessos(filters?: {
  search?: string;
  categoria?: ProcessoCategoria;
}) {
  const where: Prisma.ProcessoWhereInput = {};
  if (filters?.search) {
    where.OR = [
      { codigo: { contains: filters.search, mode: "insensitive" } },
      { nome: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters?.categoria) {
    where.categoria = filters.categoria;
  }
  return db.processo.findMany({
    where,
    orderBy: { codigo: "asc" },
    include: {
      _count: { select: { controles: true, audits: true } },
    },
  });
}

const AUDITS_ATIVAS = [
  "PLANEJADA",
  "PLANO_PENDENTE",
  "EM_EXECUCAO",
  "PENDENTE_RELATORIO",
  "ATRASADA",
] as const;

export async function getProcesso(id: string) {
  return db.processo.findUnique({
    where: { id },
    include: {
      controles: {
        include: { norma: { select: { id: true, codigo: true, nome: true } } },
        orderBy: [{ normaId: "asc" }, { ordem: "asc" }],
      },
      audits: {
        where: { status: { in: [...AUDITS_ATIVAS] } },
        include: {
          client: { select: { razaoSocial: true } },
          norma: { select: { codigo: true } },
        },
        orderBy: { dataInicio: "asc" },
      },
      _count: { select: { controles: true, audits: true } },
    },
  });
}

/** Conta quantas normas distintas referenciam o processo. */
export async function countNormasDoProcesso(id: string) {
  const grupos = await db.normaControle.findMany({
    where: { processos: { some: { id } } },
    distinct: ["normaId"],
    select: { normaId: true },
  });
  return grupos.length;
}
