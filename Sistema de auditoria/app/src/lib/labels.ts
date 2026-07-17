import type {
  ProcessoCategoria,
  Role,
  NormaStatus,
  AuditStatus,
  AuditType,
} from "@prisma/client";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  AUDITOR: "Auditor",
  FINANCEIRO: "Financeiro",
};

export const CATEGORIA_LABEL: Record<ProcessoCategoria, string> = {
  OPERACIONAL: "Operacional",
  SUPORTE: "Suporte",
  GESTAO: "Gestão",
};

export const NORMA_STATUS_LABEL: Record<NormaStatus, string> = {
  ATIVA: "Ativa",
  EM_REVISAO: "Em revisão",
  DESCONTINUADA: "Descontinuada",
};

export const AUDIT_TYPE_LABEL: Record<AuditType, string> = {
  INICIAL: "Inicial",
  MANUTENCAO: "Manutenção",
  RECERTIFICACAO: "Recertificação",
  ACOMPANHAMENTO: "Acompanhamento",
};

export const AUDIT_STATUS_LABEL: Record<AuditStatus, string> = {
  PLANEJADA: "Planejada",
  PLANO_PENDENTE: "Plano pendente",
  EM_EXECUCAO: "Em execução",
  PENDENTE_RELATORIO: "Pendente relatório",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
  ATRASADA: "Atrasada",
};
