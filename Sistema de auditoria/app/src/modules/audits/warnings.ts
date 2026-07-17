export type AuditWarning = {
  code: "CERT_VENCIDO" | "IMPARCIALIDADE";
  message: string;
};

/**
 * Regras de negócio avaliadas antes de alocar uma auditoria:
 * - RN-05: certificado do líder vencido/ausente na norma para a data.
 * - RN-06 (ISO 19011 §5.2): líder nas 2 auditorias mais recentes do
 *   cliente → este seria o 3º ciclo consecutivo (risco de imparcialidade).
 */
export function evaluateWarnings(input: {
  leaderId: string;
  leaderName: string;
  normaCodigo: string;
  certExpiresAt: Date | null;
  dataInicio: Date;
  ultimosLideresIds: string[]; // leaderIds das auditorias recentes (mais recente primeiro)
}): AuditWarning[] {
  const warnings: AuditWarning[] = [];

  if (!input.certExpiresAt || input.certExpiresAt < input.dataInicio) {
    warnings.push({
      code: "CERT_VENCIDO",
      message: `O certificado de ${input.leaderName} para ${input.normaCodigo} está vencido ou ausente para a data de início da auditoria.`,
    });
  }

  const ultimos2 = input.ultimosLideresIds.slice(0, 2);
  if (
    ultimos2.length >= 2 &&
    ultimos2.every((id) => id === input.leaderId)
  ) {
    warnings.push({
      code: "IMPARCIALIDADE",
      message: `${input.leaderName} liderou as 2 últimas auditorias deste cliente. ISO 19011 §5.2 recomenda rodízio — este seria o 3º ciclo consecutivo.`,
    });
  }

  return warnings;
}
