"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { type ActionResult, toActionError } from "@/lib/actions";
import { clientSchema } from "./schema";

const ATIVAS = [
  "PLANEJADA",
  "PLANO_PENDENTE",
  "EM_EXECUCAO",
  "PENDENTE_RELATORIO",
  "ATRASADA",
] as const;

function dadosBase(data: ReturnType<typeof clientSchema.parse>) {
  return {
    razaoSocial: data.razaoSocial,
    nomeFantasia: data.nomeFantasia,
    cnpj: data.cnpj,
    setor: data.setor,
    porte: data.porte,
    numColaboradores: data.numColaboradores ?? null,
    contractStart: data.contractStart,
    contractEnd: data.contractEnd,
    contractValue: data.contractValue ?? null,
    contacts: data.contacts as unknown as Prisma.InputJsonValue,
  };
}

export async function createClient(raw: unknown): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = clientSchema.parse(raw);

    const existente = await db.client.findUnique({ where: { cnpj: data.cnpj } });
    if (existente) {
      return {
        ok: false,
        error: "CNPJ já cadastrado.",
        fieldErrors: { cnpj: "CNPJ já cadastrado" },
      };
    }

    const client = await db.client.create({
      data: {
        ...dadosBase(data),
        normas: {
          create: data.normas.map((n) => ({
            normaId: n.normaId,
            periodicidade: n.periodicidade,
            customMeses: n.customMeses ?? null,
          })),
        },
      },
    });

    await logAction({
      userId: admin.id,
      entidade: "Client",
      entidadeId: client.id,
      acao: "CREATE",
      payload: { razaoSocial: client.razaoSocial },
    });
    revalidatePath("/clientes");
    revalidatePath("/dashboard");
    return { ok: true, id: client.id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateClient(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = clientSchema.parse(raw);

    const conflito = await db.client.findFirst({
      where: { cnpj: data.cnpj, NOT: { id } },
    });
    if (conflito) {
      return {
        ok: false,
        error: "CNPJ já cadastrado.",
        fieldErrors: { cnpj: "CNPJ já cadastrado" },
      };
    }

    await db.client.update({
      where: { id },
      data: {
        ...dadosBase(data),
        normas: {
          deleteMany: {},
          create: data.normas.map((n) => ({
            normaId: n.normaId,
            periodicidade: n.periodicidade,
            customMeses: n.customMeses ?? null,
          })),
        },
      },
    });

    await logAction({
      userId: admin.id,
      entidade: "Client",
      entidadeId: id,
      acao: "UPDATE",
      payload: { razaoSocial: data.razaoSocial },
    });
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function setClientArchived(
  id: string,
  archived: boolean,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await db.client.update({ where: { id }, data: { archived } });
    await logAction({
      userId: admin.id,
      entidade: "Client",
      entidadeId: id,
      acao: archived ? "ARCHIVE" : "UPDATE",
      payload: { archived },
    });
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

/**
 * Exclui o cliente apenas se não houver auditorias. Cliente com contrato
 * vigente e auditorias ativas só pode ser arquivado (RN).
 */
export async function deleteClient(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const client = await db.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { audits: { where: { status: { in: [...ATIVAS] } } } },
        },
      },
    });
    if (!client) return { ok: false, error: "Cliente não encontrado." };

    const totalAudits = await db.audit.count({ where: { clientId: id } });
    const vigente = client.contractEnd >= new Date();

    if (vigente && client._count.audits > 0) {
      return {
        ok: false,
        error:
          "Cliente com contrato vigente e auditorias ativas. Arquive em vez de excluir.",
      };
    }
    if (totalAudits > 0) {
      return {
        ok: false,
        error: "Cliente possui auditorias no histórico. Arquive em vez de excluir.",
      };
    }

    await db.client.delete({ where: { id } });
    await logAction({
      userId: admin.id,
      entidade: "Client",
      entidadeId: id,
      acao: "DELETE",
      payload: { razaoSocial: client.razaoSocial },
    });
    revalidatePath("/clientes");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return toActionError(err);
  }
}
