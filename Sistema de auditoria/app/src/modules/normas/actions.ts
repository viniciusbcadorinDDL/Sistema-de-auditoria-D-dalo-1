"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { type ActionResult, toActionError } from "@/lib/actions";
import { controleSchema, normaSchema } from "./schema";
import { parseControlesCsv } from "./csv";

// ============ Normas ============

export async function createNorma(raw: unknown): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = normaSchema.parse(raw);
    const norma = await db.norma.create({ data });
    await logAction({
      userId: admin.id,
      entidade: "Norma",
      entidadeId: norma.id,
      acao: "CREATE",
      payload: { codigo: norma.codigo },
    });
    revalidatePath("/normas");
    return { ok: true, id: norma.id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateNorma(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = normaSchema.parse(raw);
    await db.norma.update({ where: { id }, data });
    await logAction({
      userId: admin.id,
      entidade: "Norma",
      entidadeId: id,
      acao: "UPDATE",
      payload: { codigo: data.codigo },
    });
    revalidatePath("/normas");
    revalidatePath(`/normas/${id}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

/** Exclui a norma só se não houver auditorias associadas (senão, descontinue). */
export async function deleteNorma(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const norma = await db.norma.findUnique({
      where: { id },
      include: { _count: { select: { audits: true } } },
    });
    if (!norma) return { ok: false, error: "Norma não encontrada." };
    if (norma._count.audits > 0) {
      return {
        ok: false,
        error:
          "Norma já usada em auditorias. Marque como Descontinuada em vez de excluir.",
      };
    }
    await db.norma.delete({ where: { id } });
    await logAction({
      userId: admin.id,
      entidade: "Norma",
      entidadeId: id,
      acao: "DELETE",
      payload: { codigo: norma.codigo },
    });
    revalidatePath("/normas");
    return { ok: true };
  } catch (err) {
    return toActionError(err);
  }
}

// ============ Controles ============

export async function createControle(
  normaId: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = controleSchema.parse(raw);

    const existente = await db.normaControle.findUnique({
      where: { normaId_codigo: { normaId, codigo: data.codigo } },
    });
    if (existente) {
      return {
        ok: false,
        error: "Já existe um controle com esse código nesta norma.",
        fieldErrors: { codigo: "Código já existe nesta norma" },
      };
    }

    const max = await db.normaControle.aggregate({
      where: { normaId },
      _max: { ordem: true },
    });

    const controle = await db.normaControle.create({
      data: {
        normaId,
        codigo: data.codigo,
        titulo: data.titulo,
        descricao: data.descricao,
        parentId: data.parentId,
        ativo: data.ativo,
        ordem: (max._max.ordem ?? -1) + 1,
        processos: { connect: data.processoIds.map((id) => ({ id })) },
      },
    });

    await logAction({
      userId: admin.id,
      entidade: "NormaControle",
      entidadeId: controle.id,
      acao: "CREATE",
      payload: { normaId, codigo: controle.codigo },
    });
    revalidatePath(`/normas/${normaId}`);
    return { ok: true, id: controle.id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateControle(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = controleSchema.parse(raw);

    const atual = await db.normaControle.findUnique({ where: { id } });
    if (!atual) return { ok: false, error: "Controle não encontrado." };

    if (data.parentId === id) {
      return { ok: false, error: "Um controle não pode ser pai de si mesmo." };
    }

    const conflito = await db.normaControle.findFirst({
      where: { normaId: atual.normaId, codigo: data.codigo, NOT: { id } },
    });
    if (conflito) {
      return {
        ok: false,
        error: "Já existe um controle com esse código nesta norma.",
        fieldErrors: { codigo: "Código já existe nesta norma" },
      };
    }

    await db.normaControle.update({
      where: { id },
      data: {
        codigo: data.codigo,
        titulo: data.titulo,
        descricao: data.descricao,
        parentId: data.parentId,
        ativo: data.ativo,
        processos: { set: data.processoIds.map((pid) => ({ id: pid })) },
      },
    });

    await logAction({
      userId: admin.id,
      entidade: "NormaControle",
      entidadeId: id,
      acao: "UPDATE",
      payload: { codigo: data.codigo },
    });
    revalidatePath(`/normas/${atual.normaId}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function toggleControleAtivo(
  id: string,
  ativo: boolean,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const c = await db.normaControle.update({
      where: { id },
      data: { ativo },
    });
    await logAction({
      userId: admin.id,
      entidade: "NormaControle",
      entidadeId: id,
      acao: ativo ? "UPDATE" : "INACTIVATE",
      payload: { ativo },
    });
    revalidatePath(`/normas/${c.normaId}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

/** Exclui o controle só se não tiver sido usado em checklist de auditoria. */
export async function deleteControle(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const c = await db.normaControle.findUnique({
      where: { id },
      include: { _count: { select: { checklistItems: true, children: true } } },
    });
    if (!c) return { ok: false, error: "Controle não encontrado." };
    if (c._count.checklistItems > 0) {
      return {
        ok: false,
        error:
          "Controle já usado em auditoria. Inative-o em vez de excluir.",
      };
    }
    if (c._count.children > 0) {
      return {
        ok: false,
        error: "Remova ou mova os subcontroles antes de excluir este controle.",
      };
    }
    await db.normaControle.delete({ where: { id } });
    await logAction({
      userId: admin.id,
      entidade: "NormaControle",
      entidadeId: id,
      acao: "DELETE",
      payload: { codigo: c.codigo },
    });
    revalidatePath(`/normas/${c.normaId}`);
    return { ok: true };
  } catch (err) {
    return toActionError(err);
  }
}

// ============ Import CSV ============

export async function importControlesCsv(
  normaId: string,
  csvText: string,
): Promise<ActionResult & { criados?: number; atualizados?: number }> {
  try {
    const admin = await requireAdmin();
    const rows = parseControlesCsv(csvText);
    if (rows.length === 0) {
      return { ok: false, error: "Nenhuma linha válida encontrada no CSV." };
    }

    // Mapas de resolução: processos por código e controles existentes.
    const processos = await db.processo.findMany({
      select: { id: true, codigo: true },
    });
    const procByCodigo = new Map(
      processos.map((p) => [p.codigo.toUpperCase(), p.id]),
    );
    const existentes = await db.normaControle.findMany({
      where: { normaId },
      select: { id: true, codigo: true, ordem: true },
    });
    const ctrlByCodigo = new Map(existentes.map((c) => [c.codigo, c.id]));
    let proximaOrdem =
      existentes.reduce((m, c) => Math.max(m, c.ordem), -1) + 1;

    let criados = 0;
    let atualizados = 0;

    // Passo 1 — cria/atualiza controles (sem pai) e vincula processos.
    for (const row of rows) {
      const processoIds = row.processosCodigos
        .map((c) => procByCodigo.get(c.toUpperCase()))
        .filter((v): v is string => !!v);

      const existenteId = ctrlByCodigo.get(row.codigo);
      if (existenteId) {
        await db.normaControle.update({
          where: { id: existenteId },
          data: {
            titulo: row.titulo,
            descricao: row.descricao,
            processos: { set: processoIds.map((id) => ({ id })) },
          },
        });
        atualizados++;
      } else {
        const novo = await db.normaControle.create({
          data: {
            normaId,
            codigo: row.codigo,
            titulo: row.titulo,
            descricao: row.descricao,
            ordem: proximaOrdem++,
            processos: { connect: processoIds.map((id) => ({ id })) },
          },
        });
        ctrlByCodigo.set(row.codigo, novo.id);
        criados++;
      }
    }

    // Passo 2 — resolve hierarquia (parent_codigo).
    for (const row of rows) {
      if (!row.parentCodigo) continue;
      const childId = ctrlByCodigo.get(row.codigo);
      const parentId = ctrlByCodigo.get(row.parentCodigo);
      if (childId && parentId && childId !== parentId) {
        await db.normaControle.update({
          where: { id: childId },
          data: { parentId },
        });
      }
    }

    await logAction({
      userId: admin.id,
      entidade: "Norma",
      entidadeId: normaId,
      acao: "UPDATE",
      payload: { import: "csv", criados, atualizados },
    });
    revalidatePath(`/normas/${normaId}`);
    return { ok: true, criados, atualizados };
  } catch (err) {
    return toActionError(err);
  }
}
