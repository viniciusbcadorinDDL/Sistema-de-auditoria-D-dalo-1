-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AUDITOR', 'FINANCEIRO');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('PLANEJADA', 'PLANO_PENDENTE', 'EM_EXECUCAO', 'PENDENTE_RELATORIO', 'CONCLUIDA', 'CANCELADA', 'ATRASADA');

-- CreateEnum
CREATE TYPE "AuditType" AS ENUM ('INICIAL', 'MANUTENCAO', 'RECERTIFICACAO', 'ACOMPANHAMENTO');

-- CreateEnum
CREATE TYPE "ClassificationType" AS ENUM ('CONFORME', 'NC_MAIOR', 'NC_MENOR', 'OBSERVACAO', 'OPORTUNIDADE_MELHORIA');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('RECEBIDA', 'EM_PROCESSAMENTO', 'PAGA', 'REJEITADA');

-- CreateEnum
CREATE TYPE "SSOProvider" AS ENUM ('GOOGLE', 'MICROSOFT');

-- CreateEnum
CREATE TYPE "ProcessoCategoria" AS ENUM ('OPERACIONAL', 'SUPORTE', 'GESTAO');

-- CreateEnum
CREATE TYPE "NormaStatus" AS ENUM ('ATIVA', 'EM_REVISAO', 'DESCONTINUADA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "ssoProvider" "SSOProvider" NOT NULL,
    "ssoSubject" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "cnpj" TEXT,
    "phone" TEXT,
    "address" JSONB,
    "bankInfo" JSONB,
    "hourlyRate" DECIMAL(10,2),
    "dailyRate" DECIMAL(10,2),
    "availability" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auditor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditorCertificate" (
    "id" TEXT NOT NULL,
    "auditorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "normaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditorCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpj" TEXT NOT NULL,
    "setor" TEXT,
    "porte" TEXT,
    "numColaboradores" INTEGER,
    "contacts" JSONB NOT NULL,
    "contractStart" TIMESTAMP(3) NOT NULL,
    "contractEnd" TIMESTAMP(3) NOT NULL,
    "contractValue" DECIMAL(12,2),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientNorma" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "normaId" TEXT NOT NULL,
    "periodicidade" TEXT NOT NULL,
    "customMeses" INTEGER,

    CONSTRAINT "ClientNorma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAttachment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Norma" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "versao" TEXT NOT NULL,
    "familia" TEXT,
    "status" "NormaStatus" NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Norma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NormaControle" (
    "id" TEXT NOT NULL,
    "normaId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "parentId" TEXT,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NormaControle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Processo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" "ProcessoCategoria" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Processo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "normaId" TEXT NOT NULL,
    "tipo" "AuditType" NOT NULL,
    "escopo" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'PLANEJADA',
    "leaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditPlan" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,

    CONSTRAINT "AuditPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditChecklistItem" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "controleId" TEXT NOT NULL,
    "controleCodigo" TEXT NOT NULL,
    "controleTitulo" TEXT NOT NULL,
    "controleDesc" TEXT NOT NULL,
    "evidencia" TEXT,
    "classification" "ClassificationType",
    "recomendacao" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAttachment" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditReport" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "docxUrl" TEXT NOT NULL,
    "pdfUrl" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "sentToClientAt" TIMESTAMP(3),

    CONSTRAINT "AuditReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "auditorId" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "nfFileName" TEXT NOT NULL,
    "nfUrl" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'RECEBIDA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "evento" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "payload" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AuditorNormas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AuditorNormas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ControleProcesso" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ControleProcesso_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AuditSupport" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AuditSupport_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AuditProcesso" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AuditProcesso_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_ssoProvider_ssoSubject_key" ON "User"("ssoProvider", "ssoSubject");

-- CreateIndex
CREATE UNIQUE INDEX "Auditor_userId_key" ON "Auditor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Auditor_cpf_key" ON "Auditor"("cpf");

-- CreateIndex
CREATE INDEX "AuditorCertificate_expiresAt_idx" ON "AuditorCertificate"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Client_cnpj_key" ON "Client"("cnpj");

-- CreateIndex
CREATE INDEX "Client_contractEnd_idx" ON "Client"("contractEnd");

-- CreateIndex
CREATE UNIQUE INDEX "ClientNorma_clientId_normaId_key" ON "ClientNorma"("clientId", "normaId");

-- CreateIndex
CREATE UNIQUE INDEX "Norma_codigo_key" ON "Norma"("codigo");

-- CreateIndex
CREATE INDEX "NormaControle_normaId_ordem_idx" ON "NormaControle"("normaId", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "NormaControle_normaId_codigo_key" ON "NormaControle"("normaId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Processo_codigo_key" ON "Processo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_numero_key" ON "Audit"("numero");

-- CreateIndex
CREATE INDEX "Audit_status_dataInicio_idx" ON "Audit"("status", "dataInicio");

-- CreateIndex
CREATE INDEX "Audit_clientId_idx" ON "Audit"("clientId");

-- CreateIndex
CREATE INDEX "Audit_leaderId_idx" ON "Audit"("leaderId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditPlan_auditId_key" ON "AuditPlan"("auditId");

-- CreateIndex
CREATE INDEX "AuditChecklistItem_auditId_idx" ON "AuditChecklistItem"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditChecklistItem_auditId_controleId_key" ON "AuditChecklistItem"("auditId", "controleId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditReport_auditId_key" ON "AuditReport"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_auditId_key" ON "PaymentRequest"("auditId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "AuditLog_entidade_entidadeId_idx" ON "AuditLog"("entidade", "entidadeId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "_AuditorNormas_B_index" ON "_AuditorNormas"("B");

-- CreateIndex
CREATE INDEX "_ControleProcesso_B_index" ON "_ControleProcesso"("B");

-- CreateIndex
CREATE INDEX "_AuditSupport_B_index" ON "_AuditSupport"("B");

-- CreateIndex
CREATE INDEX "_AuditProcesso_B_index" ON "_AuditProcesso"("B");

-- AddForeignKey
ALTER TABLE "Auditor" ADD CONSTRAINT "Auditor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditorCertificate" ADD CONSTRAINT "AuditorCertificate_auditorId_fkey" FOREIGN KEY ("auditorId") REFERENCES "Auditor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditorCertificate" ADD CONSTRAINT "AuditorCertificate_normaId_fkey" FOREIGN KEY ("normaId") REFERENCES "Norma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientNorma" ADD CONSTRAINT "ClientNorma_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientNorma" ADD CONSTRAINT "ClientNorma_normaId_fkey" FOREIGN KEY ("normaId") REFERENCES "Norma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAttachment" ADD CONSTRAINT "ClientAttachment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormaControle" ADD CONSTRAINT "NormaControle_normaId_fkey" FOREIGN KEY ("normaId") REFERENCES "Norma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormaControle" ADD CONSTRAINT "NormaControle_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NormaControle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_normaId_fkey" FOREIGN KEY ("normaId") REFERENCES "Norma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditPlan" ADD CONSTRAINT "AuditPlan_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditChecklistItem" ADD CONSTRAINT "AuditChecklistItem_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditChecklistItem" ADD CONSTRAINT "AuditChecklistItem_controleId_fkey" FOREIGN KEY ("controleId") REFERENCES "NormaControle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAttachment" ADD CONSTRAINT "AuditAttachment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "AuditChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditReport" ADD CONSTRAINT "AuditReport_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuditorNormas" ADD CONSTRAINT "_AuditorNormas_A_fkey" FOREIGN KEY ("A") REFERENCES "Auditor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuditorNormas" ADD CONSTRAINT "_AuditorNormas_B_fkey" FOREIGN KEY ("B") REFERENCES "Norma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ControleProcesso" ADD CONSTRAINT "_ControleProcesso_A_fkey" FOREIGN KEY ("A") REFERENCES "NormaControle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ControleProcesso" ADD CONSTRAINT "_ControleProcesso_B_fkey" FOREIGN KEY ("B") REFERENCES "Processo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuditSupport" ADD CONSTRAINT "_AuditSupport_A_fkey" FOREIGN KEY ("A") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuditSupport" ADD CONSTRAINT "_AuditSupport_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuditProcesso" ADD CONSTRAINT "_AuditProcesso_A_fkey" FOREIGN KEY ("A") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuditProcesso" ADD CONSTRAINT "_AuditProcesso_B_fkey" FOREIGN KEY ("B") REFERENCES "Processo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
