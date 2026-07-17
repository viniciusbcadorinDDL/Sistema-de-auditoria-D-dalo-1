import type { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/session";

/** Erro de autorização — capturado pelas Server Actions para retornar mensagem amigável. */
export class ForbiddenError extends Error {
  constructor(message = "Acesso negado: permissão insuficiente.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Garante que o usuário atual tem um dos papéis informados. */
export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!roles.includes(user.role)) {
    throw new ForbiddenError();
  }
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}
