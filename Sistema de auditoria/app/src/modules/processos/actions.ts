"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { type ActionResult, toActionError } from "@/lib/actions";
import { processoSchema } from "./schema";

const ENTIDADE = "Processo";

export async function createProcesso(raw: unknown): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = processoSchema.parse(raw);

    const existente = await db.processo.findUnique({
      where: { codigo: data.codigo },
    });
    if (existente) {
      return {
        ok: false,
        error: "Código já utilizado por outro processo.",
        fieldErrors: { codigo: "Código já existe" },
      };
    }

    const processo = await db.processo.create({ data });
    await logAction({
      userId: admin.id,
      entidade: ENTIDADE,
      entidadeId: processo.id,
      acao: "CREATE",
      payload: { codigo: processo.codigo, nome: processo.nome },
    });

    revalidatePath("/processos");
    revalidatePath("/dashboard");
    return { ok: true, id: processo.id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateProcesso(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = processoSchema.parse(raw);

    const conflito = await db.processo.findFirst({
      where: { codigo: data.codigo, NOT: { id } },
    });
    if (conflito) {
      return {
        ok: false,
        error: "Código já utilizado por outro processo.",
        fieldErrors: { codigo: "Código já existe" },
      };
    }

    await db.processo.update({ where: { id }, data });
    await logAction({
      userId: admin.id,
      entidade: ENTIDADE,
      entidadeId: id,
      acao: "UPDATE",
      payload: { codigo: data.codigo },
    });

    revalidatePath("/processos");
    revalidatePath(`/processos/${id}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

/** Ativa/inativa o processo (soft). Itens em uso nunca são excluídos. */
export async function toggleProcessoAtivo(
  id: string,
  ativo: boolean,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await db.processo.update({ where: { id }, data: { ativo } });
    await logAction({
      userId: admin.id,
      entidade: ENTIDADE,
      entidadeId: id,
      acao: ativo ? "UPDATE" : "INACTIVATE",
      payload: { ativo },
    });
    revalidatePath("/processos");
    revalidatePath(`/processos/${id}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

/**
 * Exclui um processo APENAS se não houver vínculos com controles de norma
 * ou auditorias (RN: itens em uso só podem ser inativados).
 */
export async function deleteProcesso(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const processo = await db.processo.findUnique({
      where: { id },
      include: { _count: { select: { controles: true, audits: true } } },
    });
    if (!processo) {
      return { ok: false, error: "Processo não encontrado." };
    }
    if (processo._count.controles > 0 || processo._count.audits > 0) {
      return {
        ok: false,
        error:
          "Processo está vinculado a controles ou auditorias. Inative-o em vez de excluir.",
      };
    }

    await db.processo.delete({ where: { id } });
    await logAction({
      userId: admin.id,
      entidade: ENTIDADE,
      entidadeId: id,
      acao: "DELETE",
      payload: { codigo: processo.codigo },
    });
    revalidatePath("/processos");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return toActionError(err);
  }
}
