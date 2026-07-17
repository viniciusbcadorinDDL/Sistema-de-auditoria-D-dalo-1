import { cache } from "react";
import { db } from "@/lib/db";

/**
 * ATENÇÃO — STUB DE DESENVOLVIMENTO.
 *
 * Enquanto a autenticação SSO (Prompt B.3) não está ligada, este helper
 * retorna o usuário ADMIN semeado para permitir construir e testar a
 * console administrativa. Quando o Auth.js v5 entrar, substitua o corpo
 * por `auth()` lendo a sessão real.
 */
export const getCurrentUser = cache(async () => {
  const user = await db.user.findFirst({
    where: { role: "ADMIN", active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!user) {
    throw new Error(
      "Nenhum usuário ADMIN ativo encontrado. Rode `npm run db:seed`.",
    );
  }
  return user;
});
