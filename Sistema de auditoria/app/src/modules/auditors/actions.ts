"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/rbac";
import { logAction } from "@/lib/audit-log";
import { saveFile } from "@/lib/storage";
import { type ActionResult, toActionError } from "@/lib/actions";
import { auditorSchema, certificateSchema } from "./schema";

export async function createAuditor(raw: unknown): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = auditorSchema.parse(raw);

    const emailEmUso = await db.user.findUnique({ where: { email: data.email } });
    if (emailEmUso) {
      return {
        ok: false,
        error: "E-mail já cadastrado.",
        fieldErrors: { email: "E-mail já cadastrado" },
      };
    }
    const cpfEmUso = await db.auditor.findUnique({ where: { cpf: data.cpf } });
    if (cpfEmUso) {
      return {
        ok: false,
        error: "CPF já cadastrado.",
        fieldErrors: { cpf: "CPF já cadastrado" },
      };
    }

    const auditor = await db.auditor.create({
      data: {
        cpf: data.cpf,
        cnpj: data.cnpj,
        phone: data.phone,
        dailyRate: data.dailyRate,
        hourlyRate: data.hourlyRate,
        normas: { connect: data.normaIds.map((id) => ({ id })) },
        user: {
          create: {
            name: data.name,
            email: data.email,
            role: "AUDITOR",
            // SSO real é reconciliado no primeiro login (B.3).
            ssoProvider: "GOOGLE",
            ssoSubject: `pending:${data.email}`,
            active: true,
          },
        },
      },
    });

    await logAction({
      userId: admin.id,
      entidade: "Auditor",
      entidadeId: auditor.id,
      acao: "CREATE",
      payload: { email: "[redacted]" },
    });
    revalidatePath("/auditores");
    revalidatePath("/dashboard");
    return { ok: true, id: auditor.id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateAuditor(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = auditorSchema.parse(raw);

    const auditor = await db.auditor.findUnique({ where: { id } });
    if (!auditor) return { ok: false, error: "Auditor não encontrado." };

    const cpfConflito = await db.auditor.findFirst({
      where: { cpf: data.cpf, NOT: { id } },
    });
    if (cpfConflito) {
      return { ok: false, fieldErrors: { cpf: "CPF já cadastrado" }, error: "CPF já cadastrado." };
    }
    const emailConflito = await db.user.findFirst({
      where: { email: data.email, NOT: { id: auditor.userId } },
    });
    if (emailConflito) {
      return { ok: false, fieldErrors: { email: "E-mail já cadastrado" }, error: "E-mail já cadastrado." };
    }

    await db.auditor.update({
      where: { id },
      data: {
        cpf: data.cpf,
        cnpj: data.cnpj,
        phone: data.phone,
        dailyRate: data.dailyRate,
        hourlyRate: data.hourlyRate,
        normas: { set: data.normaIds.map((nid) => ({ id: nid })) },
        user: { update: { name: data.name, email: data.email } },
      },
    });

    await logAction({
      userId: admin.id,
      entidade: "Auditor",
      entidadeId: id,
      acao: "UPDATE",
    });
    revalidatePath("/auditores");
    revalidatePath(`/auditores/${id}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function setAuditorActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const auditor = await db.auditor.findUnique({ where: { id } });
    if (!auditor) return { ok: false, error: "Auditor não encontrado." };

    await db.user.update({ where: { id: auditor.userId }, data: { active } });
    await logAction({
      userId: admin.id,
      entidade: "Auditor",
      entidadeId: id,
      acao: active ? "UPDATE" : "INACTIVATE",
      payload: { active },
    });
    revalidatePath("/auditores");
    revalidatePath(`/auditores/${id}`);
    return { ok: true, id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function uploadCertificate(
  auditorId: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = certificateSchema.parse({
      type: formData.get("type"),
      issuer: formData.get("issuer"),
      issuedAt: formData.get("issuedAt"),
      expiresAt: formData.get("expiresAt"),
      normaId: formData.get("normaId") ?? undefined,
    });

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Anexe o arquivo do certificado." };
    }

    const { url } = await saveFile(`certificates/${auditorId}`, file);
    const cert = await db.auditorCertificate.create({
      data: {
        auditorId,
        type: data.type,
        issuer: data.issuer,
        issuedAt: data.issuedAt,
        expiresAt: data.expiresAt,
        normaId: data.normaId,
        fileUrl: url,
      },
    });

    await logAction({
      userId: admin.id,
      entidade: "AuditorCertificate",
      entidadeId: cert.id,
      acao: "CREATE",
      payload: { auditorId, type: data.type },
    });
    revalidatePath(`/auditores/${auditorId}`);
    return { ok: true, id: cert.id };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteCertificate(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const cert = await db.auditorCertificate.findUnique({ where: { id } });
    if (!cert) return { ok: false, error: "Certificado não encontrado." };
    await db.auditorCertificate.delete({ where: { id } });
    await logAction({
      userId: admin.id,
      entidade: "AuditorCertificate",
      entidadeId: id,
      acao: "DELETE",
      payload: { auditorId: cert.auditorId },
    });
    revalidatePath(`/auditores/${cert.auditorId}`);
    return { ok: true };
  } catch (err) {
    return toActionError(err);
  }
}
