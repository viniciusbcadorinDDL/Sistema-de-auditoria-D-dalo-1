import { ZodError } from "zod";
import { ForbiddenError } from "@/lib/rbac";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Converte um ZodError no formato de fieldErrors da ActionResult. */
export function zodToResult(err: ZodError): ActionResult {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return { ok: false, error: "Verifique os campos do formulário.", fieldErrors };
}

/**
 * Padroniza o tratamento de erros das Server Actions: autorização,
 * validação Zod e erros de unicidade do Prisma.
 */
export function toActionError(err: unknown): ActionResult {
  if (err instanceof ForbiddenError) {
    return { ok: false, error: err.message };
  }
  if (err instanceof ZodError) {
    return zodToResult(err);
  }
  // Erro de unicidade do Prisma (P2002)
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  ) {
    return { ok: false, error: "Já existe um registro com esse valor único." };
  }
  console.error("Erro na action:", err);
  return { ok: false, error: "Ocorreu um erro inesperado. Tente novamente." };
}
