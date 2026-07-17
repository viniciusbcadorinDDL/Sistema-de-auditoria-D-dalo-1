import { db } from "@/lib/db";

export async function listNormas() {
  return db.norma.findMany({
    orderBy: { codigo: "asc" },
    include: {
      _count: { select: { controles: true, audits: true, clientNormas: true } },
    },
  });
}

export async function getNorma(id: string) {
  return db.norma.findUnique({
    where: { id },
    include: {
      controles: {
        orderBy: { ordem: "asc" },
        include: {
          processos: { select: { id: true, codigo: true, nome: true } },
          _count: { select: { checklistItems: true, children: true } },
        },
      },
      _count: { select: { audits: true } },
    },
  });
}

export async function getControle(id: string) {
  return db.normaControle.findUnique({
    where: { id },
    include: {
      processos: { select: { id: true } },
      _count: { select: { checklistItems: true, children: true } },
    },
  });
}

/** Processos ativos para o multi-select de vínculo. */
export async function listProcessosAtivos() {
  return db.processo.findMany({
    where: { ativo: true },
    orderBy: { codigo: "asc" },
    select: { id: true, codigo: true, nome: true },
  });
}
