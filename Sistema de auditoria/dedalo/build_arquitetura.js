const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents, TabStopType
} = require('docx');

const border = { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 100, bottom: 100, left: 140, right: 140 };

const p = (text) => new Paragraph({
  spacing: { after: 120, line: 300 },
  children: Array.isArray(text) ? text : [new TextRun({ text })],
});
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun(text)] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun(text)] });
const h3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 220, after: 120 }, children: [new TextRun(text)] });
const bullet = (text) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 80 }, children: Array.isArray(text) ? text : [new TextRun(text)] });
const numItem = (text) => new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: Array.isArray(text) ? text : [new TextRun(text)] });

// Code block paragraph
const code = (text) => new Paragraph({
  spacing: { before: 60, after: 60, line: 260 },
  shading: { fill: "F4F6FA", type: ShadingType.CLEAR, color: "auto" },
  border: { left: { style: BorderStyle.SINGLE, size: 12, color: "3A6FA0", space: 8 } },
  children: text.split("\n").map((line, i, arr) => new TextRun({
    text: line + (i < arr.length - 1 ? "\n" : ""),
    font: "Consolas", size: 18, break: i > 0 ? 1 : 0,
  })),
});

const codeBlock = (text) => {
  // For multi-line code, create one paragraph per line with monospace
  return text.split("\n").map(line => new Paragraph({
    spacing: { after: 0, line: 260 },
    shading: { fill: "F4F6FA", type: ShadingType.CLEAR, color: "auto" },
    children: [new TextRun({ text: line || " ", font: "Consolas", size: 18 })],
  }));
};

const headerCell = (text, width) => new TableCell({
  borders, width: { size: width, type: WidthType.DXA },
  shading: { fill: "1F3A5F", type: ShadingType.CLEAR, color: "auto" },
  margins: cellMargins,
  children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF" })] })],
});
const dataCell = (text, width) => new TableCell({
  borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
  children: [new Paragraph({ children: [new TextRun(text)] })],
});
const tableFromRows = (headers, rows, widths) => new Table({
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: widths,
  rows: [
    new TableRow({ tableHeader: true, children: headers.map((h, i) => headerCell(h, widths[i])) }),
    ...rows.map(row => new TableRow({ children: row.map((cell, i) => dataCell(cell, widths[i])) })),
  ],
});

const content = [];

// COVER
content.push(new Paragraph({ spacing: { before: 2400, after: 240 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "DÉDALO", bold: true, size: 56, color: "1F3A5F" })] }));
content.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 480 },
  children: [new TextRun({ text: "Sistema de Gestão de Auditorias", size: 36, color: "1F3A5F" })] }));
content.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 },
  children: [new TextRun({ text: "Arquitetura Técnica + Guia para Claude Code", size: 28, italics: true })] }));
content.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1200 },
  children: [new TextRun({ text: "Versão 1.0  •  Junho de 2026", size: 22, color: "666666" })] }));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("Sumário"));
content.push(new TableOfContents("Sumário", { hyperlink: true, headingStyleRange: "1-3" }));
content.push(new Paragraph({ children: [new PageBreak()] }));

// 1. RESUMO
content.push(h1("1. Resumo Executivo"));
content.push(p("Este documento descreve a arquitetura técnica recomendada para o Sistema de Gestão de Auditorias da Dédalo e fornece um guia operacional para construí-lo utilizando o Claude Code. A stack escolhida prioriza produtividade de desenvolvimento via IA, ecossistema maduro, custo previsível e baixa fricção operacional."));
content.push(h2("1.1. Stack Recomendada"));
content.push(tableFromRows(["Camada", "Tecnologia", "Por quê"], [
  ["Frontend + Backend", "Next.js 15 (App Router) + TypeScript", "Full-stack em um único repositório; ótimo desempenho com IA; React Server Components reduzem código."],
  ["UI", "Tailwind CSS + shadcn/ui", "Componentes acessíveis e customizáveis; Claude Code escreve excelente Tailwind."],
  ["Banco de Dados", "PostgreSQL 16 (Supabase ou Neon)", "Padrão de mercado; suporte a JSONB, Row Level Security, full-text search."],
  ["ORM", "Prisma 5", "Schema declarativo; type-safe; ótimo com Claude Code para gerar migrations."],
  ["Autenticação SSO", "Auth.js (NextAuth) + Google + Microsoft Entra", "Suporte nativo a múltiplos provedores SSO; integração com Prisma."],
  ["Armazenamento de arquivos", "Supabase Storage ou AWS S3", "Anexos de certificados, NFs, planos, evidências."],
  ["Geração DOCX", "docxtemplater + PizZip", "Template Word com placeholders; sintaxe simples."],
  ["Geração PDF", "LibreOffice headless (via cron job) ou Gotenberg", "Converte o DOCX gerado em PDF mantendo formatação."],
  ["E-mail transacional", "Resend ou Postmark", "API simples; templates React Email; alta entregabilidade."],
  ["Jobs agendados (notificações)", "Inngest ou Vercel Cron + Trigger.dev", "Cron jobs serverless para lembretes."],
  ["Deploy", "Vercel (web) + Supabase (DB/storage)", "CI/CD automático; preview por PR; sem operação de servidor."],
  ["Observabilidade", "Sentry + Vercel Analytics + Better Stack Logs", "Erros, performance e logs centralizados."],
], [2400, 3200, 3760]));

content.push(h2("1.2. Por que esta stack para Claude Code"));
content.push(bullet("Next.js + TypeScript + Prisma é o ecossistema com maior densidade de exemplos de qualidade — Claude Code escreve código idiomático com baixíssima taxa de erro."));
content.push(bullet("Monorepo único reduz contexto que precisa ser carregado a cada prompt."));
content.push(bullet("Tipagem forte (TypeScript + Prisma) permite que erros de integração sejam capturados em tempo de compilação, reduzindo idas e voltas com a IA."));
content.push(bullet("Componentes shadcn/ui são copiados para dentro do projeto (não são lib externa), então Claude Code pode adaptá-los livremente."));
content.push(bullet("Vercel + Supabase eliminam DevOps no início, permitindo focar em features."));

content.push(new Paragraph({ children: [new PageBreak()] }));

// 2. ARQUITETURA DE ALTO NÍVEL
content.push(h1("2. Arquitetura de Alto Nível"));

content.push(h2("2.1. Diagrama de Componentes"));
content.push(...codeBlock(`┌─────────────────────────────────────────────────────────────────┐
│                       USUÁRIOS (Browser)                         │
│         Admin    │    Auditor    │    Financeiro                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
              ┌─────────────────────────────────┐
              │  Next.js 15 App (Vercel)         │
              │  ┌─────────────────────────────┐ │
              │  │ React Server Components UI  │ │
              │  ├─────────────────────────────┤ │
              │  │ Server Actions (Mutations)  │ │
              │  ├─────────────────────────────┤ │
              │  │ API Routes (REST)           │ │
              │  ├─────────────────────────────┤ │
              │  │ Auth.js (SSO Google/MS)     │ │
              │  ├─────────────────────────────┤ │
              │  │ Prisma Client (Type-safe)   │ │
              │  └─────────────────────────────┘ │
              └─────┬───────────┬────────┬─────┘
                    │           │        │
        ┌───────────┘           │        └────────────┐
        ▼                       ▼                     ▼
 ┌────────────┐     ┌──────────────────┐    ┌──────────────────┐
 │ PostgreSQL │     │ Supabase Storage │    │ Inngest / Cron   │
 │ (Supabase) │     │ (S3 compatible)  │    │ (Jobs/Lembretes) │
 └────────────┘     └──────────────────┘    └────────┬─────────┘
                                                     │
        ┌────────────────────────────────────────────┤
        ▼                       ▼                    ▼
┌──────────────┐      ┌──────────────────┐  ┌──────────────────┐
│ Resend       │      │ LibreOffice/     │  │ Sentry / Logs    │
│ (E-mails)    │      │ Gotenberg        │  │ (Observabilidade)│
│              │      │ (DOCX → PDF)     │  │                  │
└──────────────┘      └──────────────────┘  └──────────────────┘`));

content.push(h2("2.2. Decisões de arquitetura"));
content.push(bullet("Monolito modular: tudo em um repositório Next.js, organizado em módulos por domínio (auditors, clients, audits, payments). Migrar para microserviços só quando houver dor real."));
content.push(bullet("Server Components por padrão: telas que apenas leem dados são RSC, eliminando boilerplate de fetching no cliente."));
content.push(bullet("Server Actions para mutações: chamadas mutativas (criar auditor, salvar checklist) usam Server Actions com validação Zod."));
content.push(bullet("Row Level Security (RLS) no Postgres: regra crítica RN-01 (auditor só vê suas auditorias) implementada no banco, não só na aplicação, garantindo proteção mesmo em caso de bug no app."));
content.push(bullet("Geração de relatório assíncrona: ao concluir auditoria, dispara job que gera DOCX, converte para PDF, salva no storage e notifica o admin."));
content.push(bullet("Separação de consoles por route groups: src/app/(admin)/... e src/app/(auditor)/... vivem no mesmo monorepo mas têm layouts, sidebars e middlewares de autorização distintos. O auditor é redirecionado automaticamente se tentar acessar uma rota admin."));
content.push(bullet("Vínculo Controle ↔ Processo (N:N) no schema: permite filtrar o checklist da auditoria por processo sem queries complexas. Auditorias guardam também os processos selecionados (AuditProcesso) para preservar o escopo."));

content.push(new Paragraph({ children: [new PageBreak()] }));

// 3. MODELO DE DADOS
content.push(h1("3. Modelo de Dados (Prisma Schema)"));
content.push(p("Schema completo no formato Prisma. Pode ser copiado direto para prisma/schema.prisma:"));
content.push(...codeBlock(`// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db    { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role { ADMIN AUDITOR FINANCEIRO }
enum AuditStatus { PLANEJADA PLANO_PENDENTE EM_EXECUCAO PENDENTE_RELATORIO CONCLUIDA CANCELADA ATRASADA }
enum AuditType { INICIAL MANUTENCAO RECERTIFICACAO ACOMPANHAMENTO }
enum ClassificationType { CONFORME NC_MAIOR NC_MENOR OBSERVACAO OPORTUNIDADE_MELHORIA }
enum PaymentStatus { RECEBIDA EM_PROCESSAMENTO PAGA REJEITADA }
enum SSOProvider { GOOGLE MICROSOFT }

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  role         Role
  ssoProvider  SSOProvider
  ssoSubject   String
  active       Boolean  @default(true)
  createdAt    DateTime @default(now())
  auditor      Auditor?
  auditsLed    Audit[]  @relation("AuditLeader")
  auditsSupport Audit[] @relation("AuditSupport")
  notifications Notification[]
  auditLogs    AuditLog[]
  @@unique([ssoProvider, ssoSubject])
}

model Auditor {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  cpf             String   @unique
  cnpj            String?
  phone           String?
  address         Json?
  bankInfo        Json?
  hourlyRate      Decimal?
  dailyRate       Decimal?
  availability    Json?
  normas          Norma[]
  certificates    AuditorCertificate[]
}

model AuditorCertificate {
  id           String   @id @default(cuid())
  auditorId    String
  auditor      Auditor  @relation(fields: [auditorId], references: [id])
  type         String
  issuer       String
  issuedAt     DateTime
  expiresAt    DateTime
  fileUrl      String
  normaId      String?
  norma        Norma?   @relation(fields: [normaId], references: [id])
}

model Client {
  id              String   @id @default(cuid())
  razaoSocial     String
  nomeFantasia    String?
  cnpj            String   @unique
  setor           String?
  porte           String?
  numColaboradores Int?
  contacts        Json
  contractStart   DateTime
  contractEnd     DateTime
  contractValue   Decimal?
  normas          ClientNorma[]
  attachments     ClientAttachment[]
  audits          Audit[]
}

model ClientNorma {
  id           String   @id @default(cuid())
  clientId     String
  client       Client   @relation(fields: [clientId], references: [id])
  normaId      String
  norma        Norma    @relation(fields: [normaId], references: [id])
  periodicidade String  // ANUAL, SEMESTRAL, TRIMESTRAL, CUSTOM
  @@unique([clientId, normaId])
}

model ClientAttachment {
  id        String  @id @default(cuid())
  clientId  String
  client    Client  @relation(fields: [clientId], references: [id])
  tipo      String
  fileUrl   String
  createdAt DateTime @default(now())
}

model Norma {
  id           String   @id @default(cuid())
  codigo       String   @unique // "ISO 9001:2015"
  nome         String
  versao       String
  familia      String?
  status       String   @default("ATIVA") // ATIVA | EM_REVISAO | DESCONTINUADA
  controles    NormaControle[]
  auditors     Auditor[]
  clientNormas ClientNorma[]
  audits       Audit[]
  certificates AuditorCertificate[]
}

model NormaControle {
  id          String   @id @default(cuid())
  normaId     String
  norma       Norma    @relation(fields: [normaId], references: [id])
  codigo      String   // "7.1.5.2"
  titulo      String
  descricao   String   @db.Text
  parentId    String?
  parent      NormaControle?  @relation("ControleHierarchy", fields: [parentId], references: [id])
  children    NormaControle[] @relation("ControleHierarchy")
  ordem       Int
  processos   Processo[]   @relation("ControleProcesso")
  checklistItems AuditChecklistItem[]
  @@unique([normaId, codigo])
}

model Processo {
  id          String   @id @default(cuid())
  codigo      String   @unique  // "RH", "DEV", "COMPRAS"
  nome        String              // "Gestão de Recursos Humanos"
  descricao   String?  @db.Text
  categoria   String?             // OPERACIONAL | SUPORTE | GESTAO
  status      String   @default("ATIVO")
  controles   NormaControle[] @relation("ControleProcesso")
  audits      Audit[]         @relation("AuditProcesso")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Audit {
  id           String   @id @default(cuid())
  numero       String   @unique  // 2026-018
  clientId     String
  client       Client   @relation(fields: [clientId], references: [id])
  normaId      String
  norma        Norma    @relation(fields: [normaId], references: [id])
  tipo         AuditType
  escopo       String?  @db.Text
  dataInicio   DateTime
  dataFim      DateTime
  status       AuditStatus @default(PLANEJADA)
  leaderId     String
  leader       User     @relation("AuditLeader", fields: [leaderId], references: [id])
  support      User[]   @relation("AuditSupport")
  processos    Processo[] @relation("AuditProcesso")  // processos selecionados para esta auditoria
  plan         AuditPlan?
  checklist    AuditChecklistItem[]
  report       AuditReport?
  payment      PaymentRequest?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model AuditPlan {
  id        String  @id @default(cuid())
  auditId   String  @unique
  audit     Audit   @relation(fields: [auditId], references: [id])
  fileUrl   String
  uploadedAt DateTime @default(now())
  uploadedBy String
}

model AuditChecklistItem {
  id           String   @id @default(cuid())
  auditId      String
  audit        Audit    @relation(fields: [auditId], references: [id])
  controleId   String
  controle     NormaControle @relation(fields: [controleId], references: [id])
  evidencia    String?  @db.Text
  classification ClassificationType?
  recomendacao String?  @db.Text
  attachments  AuditAttachment[]
  updatedAt    DateTime @updatedAt
  @@unique([auditId, controleId])
}

model AuditAttachment {
  id        String   @id @default(cuid())
  itemId    String
  item      AuditChecklistItem @relation(fields: [itemId], references: [id])
  fileUrl   String
  fileName  String
  createdAt DateTime @default(now())
}

model AuditReport {
  id           String   @id @default(cuid())
  auditId      String   @unique
  audit        Audit    @relation(fields: [auditId], references: [id])
  versao       Int      @default(1)
  docxUrl      String
  pdfUrl       String?
  generatedAt  DateTime @default(now())
  approvedBy   String?
  approvedAt   DateTime?
  sentToClientAt DateTime?
}

model PaymentRequest {
  id        String   @id @default(cuid())
  auditId   String   @unique
  audit     Audit    @relation(fields: [auditId], references: [id])
  auditorId String
  valor     Decimal
  nfUrl     String
  descricao String?  @db.Text
  status    PaymentStatus @default(RECEBIDA)
  createdAt DateTime @default(now())
  paidAt    DateTime?
  rejectionReason String?
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  evento    String
  payload   Json
  read      Boolean  @default(false)
  emailSent Boolean  @default(false)
  createdAt DateTime @default(now())
  @@index([userId, read])
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  entidade    String
  entidadeId  String
  acao        String
  payload     Json?
  ip          String?
  userAgent   String?
  createdAt   DateTime @default(now())
  @@index([entidade, entidadeId])
  @@index([userId])
}`));

content.push(new Paragraph({ children: [new PageBreak()] }));

// 4. ESTRUTURA
content.push(h1("4. Estrutura do Projeto"));
content.push(p("Organização proposta dentro de um único repositório Next.js:"));
content.push(...codeBlock(`dedalo-auditorias/
├── CLAUDE.md                       # contexto persistente para Claude Code
├── README.md
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                     # popular normas pré-carregadas
├── public/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # redireciona conforme role
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── api/auth/[...nextauth]/route.ts
│   │   ├── (admin)/              # CONSOLE ADMINISTRATIVA
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── auditores/...
│   │   │   ├── clientes/...
│   │   │   ├── normas/...        # CRUD de normas + controles
│   │   │   ├── processos/...     # CRUD de processos
│   │   │   ├── auditorias/...
│   │   │   ├── cronograma/page.tsx
│   │   │   └── configuracoes/...
│   │   ├── (auditor)/            # CONSOLE DO AUDITOR (acesso restrito)
│   │   │   ├── minhas-auditorias/...
│   │   │   └── execucao/[id]/...
│   │   ├── (financeiro)/
│   │   │   └── pagamentos/...
│   │   └── api/
│   │       ├── reports/generate/route.ts
│   │       ├── webhooks/inngest/route.ts
│   │       └── cron/...
│   ├── components/
│   │   ├── ui/                     # shadcn (button, dialog, table, etc)
│   │   └── domain/                 # AuditorForm, ChecklistItem, etc.
│   ├── lib/
│   │   ├── db.ts                   # prisma client
│   │   ├── auth.ts                 # auth.js config
│   │   ├── email/
│   │   │   ├── client.ts           # resend client
│   │   │   └── templates/          # react-email templates
│   │   ├── storage.ts              # upload/download helpers
│   │   ├── reports/
│   │   │   ├── generate-docx.ts
│   │   │   └── docx-to-pdf.ts
│   │   └── rbac.ts                 # checagem de permissões
│   ├── modules/
│   │   ├── auditors/
│   │   │   ├── actions.ts          # server actions
│   │   │   ├── queries.ts          # data fetching
│   │   │   └── schema.ts           # zod schemas
│   │   ├── clients/...
│   │   ├── normas/...              # normas + controles + vínculo a processos
│   │   ├── processos/...
│   │   ├── audits/...
│   │   ├── payments/...
│   │   └── notifications/
│   │       ├── jobs.ts             # inngest functions
│   │       └── events.ts
│   └── inngest/
│       └── client.ts
├── docs/
│   ├── REQUISITOS.md
│   └── DECISOES_ARQUITETURA.md
└── tests/
    ├── unit/
    └── e2e/                        # playwright`));

content.push(new Paragraph({ children: [new PageBreak()] }));

// 5. INTEGRAÇÕES
content.push(h1("5. Integrações"));

content.push(h2("5.1. SSO Google + Microsoft (Auth.js)"));
content.push(p("Auth.js suporta nativamente ambos os provedores. Configuração em src/lib/auth.ts:"));
content.push(...codeBlock(`import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import EntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({ clientId: process.env.GOOGLE_ID!, clientSecret: process.env.GOOGLE_SECRET! }),
    EntraID({
      clientId: process.env.MS_ENTRA_ID!,
      clientSecret: process.env.MS_ENTRA_SECRET!,
      issuer: process.env.MS_ENTRA_ISSUER!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // só permite usuários previamente cadastrados pelo admin
      const dbUser = await db.user.findUnique({ where: { email: user.email! } });
      if (!dbUser || !dbUser.active) return false;
      return true;
    },
    async session({ session, user }) {
      session.user.role = (user as any).role;
      session.user.id = user.id;
      return session;
    },
  },
});`));

content.push(h2("5.2. Geração de Relatório DOCX → PDF"));
content.push(p("Fluxo: Server Action lê dados do checklist → preenche template DOCX com docxtemplater → salva no storage → enfileira job que converte para PDF via Gotenberg → atualiza AuditReport com pdfUrl."));
content.push(...codeBlock(`// src/lib/reports/generate-docx.ts
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "node:fs";

export async function generateAuditReport(auditId: string) {
  const audit = await db.audit.findUniqueOrThrow({
    where: { id: auditId },
    include: { client: true, norma: true, leader: true,
               checklist: { include: { controle: true, attachments: true } } },
  });

  const template = fs.readFileSync("public/templates/audit-report.docx");
  const zip = new PizZip(template);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  doc.render({
    numero: audit.numero,
    cliente: audit.client.razaoSocial,
    norma: audit.norma.codigo,
    leader: audit.leader.name,
    data: audit.dataInicio.toLocaleDateString("pt-BR"),
    naoConformidades: audit.checklist.filter(c =>
      ["NC_MAIOR", "NC_MENOR"].includes(c.classification ?? "")),
    conformidades: audit.checklist.filter(c => c.classification === "CONFORME"),
    // ...
  });

  const buf = doc.getZip().generate({ type: "nodebuffer" });
  return await uploadToStorage(buf, \`reports/\${audit.numero}.docx\`);
}`));

content.push(h2("5.3. E-mails Transacionais (Resend + React Email)"));
content.push(...codeBlock(`// src/lib/email/templates/auditor-allocated.tsx
import { Html, Button, Text } from "@react-email/components";

export default function AuditorAllocated({ name, cliente, norma, data, link }) {
  return (
    <Html>
      <Text>Olá {name},</Text>
      <Text>Você foi alocado em uma auditoria:</Text>
      <Text><strong>Cliente:</strong> {cliente}</Text>
      <Text><strong>Norma:</strong> {norma}</Text>
      <Text><strong>Data:</strong> {data}</Text>
      <Button href={link}>Abrir Auditoria</Button>
    </Html>
  );
}`));

content.push(h2("5.4. Jobs Agendados (Inngest)"));
content.push(p("Cada notificação recorrente é uma função Inngest. Exemplo do lembrete de 30 dias antes da auditoria:"));
content.push(...codeBlock(`// src/modules/notifications/jobs.ts
import { inngest } from "@/inngest/client";

export const remindAuditPlan = inngest.createFunction(
  { id: "remind-audit-plan" },
  { cron: "0 9 * * *" }, // todo dia às 9h
  async ({ step }) => {
    const audits = await db.audit.findMany({
      where: {
        status: "PLANEJADA",
        dataInicio: {
          gte: addDays(new Date(), 29),
          lt:  addDays(new Date(), 31),
        },
        plan: null,
      },
      include: { leader: true, client: true, norma: true },
    });

    for (const audit of audits) {
      await step.run(\`send-\${audit.id}\`, async () => {
        await sendEmail({
          to: audit.leader.email,
          template: "audit-plan-reminder",
          data: { audit },
        });
      });
    }
  }
);`));

content.push(h2("5.5. Row Level Security (auditor só vê suas auditorias)"));
content.push(p("Implementar via Prisma extension ou direto no Postgres com policies:"));
content.push(...codeBlock(`-- prisma/migrations/.../security.sql
ALTER TABLE "Audit" ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_admin_all ON "Audit"
  USING (current_setting('app.role') = 'ADMIN');

CREATE POLICY audit_auditor_own ON "Audit"
  USING (
    current_setting('app.role') = 'AUDITOR'
    AND (
      "leaderId" = current_setting('app.user_id')
      OR EXISTS (
        SELECT 1 FROM "_AuditSupport"
        WHERE "A" = "Audit"."id"
          AND "B" = current_setting('app.user_id')
      )
    )
  );`));

content.push(new Paragraph({ children: [new PageBreak()] }));

// 6. PLANO DE DESENVOLVIMENTO
content.push(h1("6. Plano de Desenvolvimento (Sprints)"));
content.push(p("Sugestão de 5 sprints quinzenais (~10 semanas) para o MVP completo, usando Claude Code:"));

content.push(h2("Sprint 0 — Fundação (3-5 dias)"));
content.push(bullet("Provisionar conta Vercel + Supabase + Resend + Inngest + Sentry."));
content.push(bullet("Inicializar projeto Next.js + Prisma + Tailwind + shadcn/ui."));
content.push(bullet("Configurar Auth.js com Google e Microsoft Entra (sandbox)."));
content.push(bullet("Criar CLAUDE.md (Apêndice A) e fazer commit inicial."));

content.push(h2("Sprint 1 — Cadastros Mestres e Autenticação"));
content.push(bullet("Estruturar route groups (admin)/ e (auditor)/ com layouts separados e middleware de autorização."));
content.push(bullet("CRUD de Users (admin cadastra), Auditores e Clientes na console administrativa."));
content.push(bullet("CRUD de Processos (ex.: RH, Desenvolvimento, Compras)."));
content.push(bullet("CRUD de Normas e Controles, com vínculo many-to-many a Processos."));
content.push(bullet("Upload de certificados e anexos contratuais."));
content.push(bullet("Tela de configurações da empresa."));
content.push(bullet("RLS habilitado; AuditLog em todas as ações."));
content.push(bullet("Seed inicial de Normas e Processos (controles principais de ISO 9001 e ISO 27001 + 8-10 processos típicos)."));

content.push(h2("Sprint 2 — Alocação e Cronograma"));
content.push(bullet("CRUD de Auditorias com seleção de cliente, norma, processos a auditar e auditor."));
content.push(bullet("Validações: certificado vigente, imparcialidade ISO 19011."));
content.push(bullet("Cronograma anual visual."));
content.push(bullet("Notificação de alocação via Resend."));
content.push(bullet("Inngest: lembretes de 30/15/3 dias."));

content.push(h2("Sprint 3 — Console do Auditor: Execução e Relatório"));
content.push(bullet("Layout enxuto da console do auditor (apenas operação)."));
content.push(bullet("Lista \"Minhas Auditorias\" restrita via RLS."));
content.push(bullet("Upload de plano de auditoria."));
content.push(bullet("Tela de execução com checklist por norma e filtro lateral por processo."));
content.push(bullet("Classificação ISO 19011 e anexos por item."));
content.push(bullet("Geração de relatório DOCX a partir de template."));
content.push(bullet("Conversão DOCX → PDF via Gotenberg."));
content.push(bullet("Aprovação pelo admin + envio ao cliente."));
content.push(bullet("Notificações: relatório pendente (5/10/14d), atrasado."));

content.push(h2("Sprint 4 — Pagamentos e Polimento"));
content.push(bullet("Fluxo de solicitação de pagamento (NF + valor)."));
content.push(bullet("Tela de pagamentos para o financeiro."));
content.push(bullet("Dashboard com KPIs."));
content.push(bullet("Alertas de certificado vencendo e renovação contratual."));
content.push(bullet("Testes E2E (Playwright) dos fluxos críticos."));
content.push(bullet("Deploy em produção; treinamento da equipe."));

content.push(new Paragraph({ children: [new PageBreak()] }));

// 7. SEGURANÇA E COMPLIANCE
content.push(h1("7. Segurança e Compliance (LGPD)"));
content.push(tableFromRows(["Requisito LGPD", "Implementação"], [
  ["Base legal de tratamento", "Execução de contrato (auditoria) + consentimento de cliente."],
  ["Inventário de dados", "Documentar no docs/LGPD.md as categorias de dados (PII, financeiros, auditoriais)."],
  ["Minimização", "Coletar apenas o necessário; CPF criptografado em repouso."],
  ["Direito de acesso", "Endpoint /api/me/data-export gera ZIP com dados do usuário."],
  ["Direito de exclusão", "Soft delete + job que anonimiza após 5 anos (prazo legal de retenção fiscal)."],
  ["Retenção", "Política configurável; default: dados financeiros 5 anos, relatórios 5 anos, logs 5 anos."],
  ["Encarregado (DPO)", "Indicar contato em /privacy."],
  ["Criptografia em repouso", "Postgres com TDE (Supabase faz por padrão); arquivos no S3 com SSE-AES256."],
  ["Criptografia em trânsito", "TLS 1.3 forçado em todos os endpoints."],
  ["Trilha de auditoria", "AuditLog em todas as escritas, acessível ao admin."],
  ["Vazamento de dados", "Alertas no Sentry; processo documentado de notificação à ANPD em 72h."],
], [3200, 6160]));

content.push(new Paragraph({ children: [new PageBreak()] }));

// 8. CUSTOS
content.push(h1("8. Estimativa de Custos Mensais (Infra)"));
content.push(p("Valores aproximados em USD para a operação inicial (até 50 auditores, 200 clientes, 1.000 auditorias/ano):"));
content.push(tableFromRows(["Serviço", "Plano", "Custo Estimado"], [
  ["Vercel (Pro)", "Pro - 1 projeto", "US$ 20/mês"],
  ["Supabase (Pro)", "Pro - DB 8GB + 100GB storage", "US$ 25/mês"],
  ["Resend", "Pro - 50k e-mails/mês", "US$ 20/mês"],
  ["Inngest", "Starter (gratuito até 50k execuções)", "US$ 0 (depois US$ 20)"],
  ["Sentry", "Team", "US$ 26/mês"],
  ["Gotenberg (Fly.io)", "Shared CPU 256MB", "US$ 5/mês"],
  ["Domínio + e-mail corporativo", "Já existe (Google Workspace)", "—"],
  ["Total estimado", "", "≈ US$ 100/mês (~R$ 550)"],
], [3200, 3200, 2960]));
content.push(p("Custo de desenvolvimento (uso do Claude Code): variável conforme intensidade — em média US$ 50-150/mês de tokens para uma squad pequena."));

content.push(new Paragraph({ children: [new PageBreak()] }));

// APÊNDICE A — CLAUDE.md
content.push(h1("Apêndice A — CLAUDE.md (raiz do projeto)"));
content.push(p("Este é o arquivo que o Claude Code lê automaticamente ao abrir o repositório. Cole o conteúdo abaixo no arquivo CLAUDE.md na raiz do projeto:"));
content.push(...codeBlock(`# Dédalo - Sistema de Gestão de Auditorias

## Sobre o projeto
Sistema interno da Dédalo para gestão do ciclo completo de auditorias:
cadastro de auditores e clientes, alocação, execução com checklist,
geração de relatórios DOCX/PDF e fluxo de faturamento dos auditores.

## Stack
- Next.js 15 (App Router) + TypeScript estrito
- Prisma + PostgreSQL (Supabase)
- Auth.js com SSO Google e Microsoft Entra (SEM senhas locais)
- Tailwind CSS + shadcn/ui
- Resend para e-mail, Inngest para jobs agendados
- docxtemplater + Gotenberg para relatórios

## Comandos
- \`npm run dev\` — sobe a aplicação local
- \`npm run db:migrate\` — \`prisma migrate dev\`
- \`npm run db:seed\` — popula normas e usuários de teste
- \`npm run test\` — vitest unitário
- \`npm run test:e2e\` — playwright

## Convenções
- Sempre usar Server Components por padrão. Marcar "use client" só quando
  precisar de interatividade.
- Mutações via Server Actions com validação Zod, NUNCA via fetch direto
  ao banco do cliente.
- Toda escrita no banco gera entrada em AuditLog.
- Strings de UI sempre em pt-BR.
- Arquivos de domínio em \`src/modules/<dominio>/\` (actions, queries, schema).
- Componentes de UI genéricos em \`src/components/ui/\`, componentes de
  domínio em \`src/components/domain/\`.
- Testes unitários ao lado do arquivo: \`xxx.test.ts\`.
- Commits em português, no padrão Conventional Commits.

## Consoles
O sistema tem DUAS consoles distintas, separadas por route groups:
- (admin)/  — Console Administrativa: cadastros (auditores, clientes,
  normas, controles, processos), alocação, aprovação de relatórios e
  pagamentos. Acessada por Role=ADMIN.
- (auditor)/ — Console do Auditor: APENAS execução das auditorias
  alocadas. Sem permissão de criar/editar dados-mestre.
O middleware redireciona o auditor se ele tentar acessar /admin/*.

## Regras de negócio críticas
1. Auditor só vê auditorias em que é líder ou apoio (enforced via RLS).
2. Admin vê tudo via console (admin).
3. Auditor NÃO cria/edita/exclui normas, controles, processos,
   clientes ou outros auditores. Acesso somente leitura ao catálogo.
4. Solicitação de pagamento exige plano + relatório aprovados.
5. Bloqueio de alocação se certificado do auditor estiver vencido na
   norma (warning sobrescritível).
6. Warning de imparcialidade ISO 19011 §5.2 ao alocar 3+ vezes o mesmo
   auditor no mesmo cliente.
7. Relatório atrasado: 15 dias após fim da auditoria.
8. Norma/controle/processo usado em auditoria existente: apenas
   inativar, nunca excluir.
9. Checklist de auditoria filtra controles pelos processos
   selecionados na alocação (Audit.processos). Se vazio, mostra todos.

## Modelos principais
- User (com Role: ADMIN | AUDITOR | FINANCEIRO)
- Auditor, AuditorCertificate
- Client, ClientNorma, ClientAttachment
- Norma, NormaControle (hierárquico)
- Processo (cadastro mestre, ex.: RH, DEV, COMPRAS)
- ControleProcesso (N:N entre NormaControle e Processo)
- Audit (com lista de Processos selecionados via AuditProcesso)
- AuditPlan, AuditChecklistItem, AuditAttachment, AuditReport
- PaymentRequest
- Notification, AuditLog

Schema completo em \`prisma/schema.prisma\`.

## Padrões de prompt
- Antes de criar nova feature, leia o módulo correspondente em
  \`src/modules/<dominio>/\`.
- Antes de mudar o schema, escreva uma migration; não edite o banco
  manualmente.
- Sempre escreva o teste unitário junto com a action.
- Para gerar PDF, use o helper em \`src/lib/reports/\`. Não importe
  bibliotecas de PDF diretamente nas pages.

## Não fazer
- Não usar localStorage/sessionStorage (não persistir dados sensíveis).
- Não logar PII (CPF, CNPJ, e-mail) em texto plano nos logs.
- Não bypass RLS no banco. Se precisar de query admin, usar o
  \`db.$accelerate.withAdmin()\` documentado em src/lib/db.ts.
- Não usar bibliotecas externas para fazer parsing de DOCX — usar
  apenas docxtemplater.`));

content.push(new Paragraph({ children: [new PageBreak()] }));

// APÊNDICE B — Prompts iniciais
content.push(h1("Apêndice B — Prompts iniciais para Claude Code"));
content.push(p("Sequência sugerida de prompts para conduzir a construção do MVP. Execute um por vez, revise o código gerado, faça commit e siga para o próximo."));

content.push(h2("B.1 — Setup inicial"));
content.push(...codeBlock(`Inicialize um projeto Next.js 15 com App Router, TypeScript estrito,
Tailwind CSS e ESLint. Em seguida adicione:
- shadcn/ui (init com tema neutro, base color slate)
- Prisma com schema vazio apontando para DATABASE_URL no .env
- Auth.js v5 com providers Google e Microsoft Entra ID
- Resend para e-mail, com client em src/lib/email/client.ts
- Inngest com client em src/inngest/client.ts
- Vitest + Playwright para testes

Crie .env.example com todas as variáveis necessárias e atualize o
CLAUDE.md (que já existe na raiz) com os comandos npm reais que
funcionarem após o setup.`));

content.push(h2("B.2 — Schema do banco"));
content.push(...codeBlock(`Substitua prisma/schema.prisma pelo schema completo do documento de
arquitetura (seção 3). Rode \`prisma migrate dev --name init\` e crie
um seed em prisma/seed.ts que popula:
- 1 usuário ADMIN (meu e-mail)
- 5 normas (ISO 9001:2015, ISO 27001:2022, ISO 14001:2015,
  ISO 45001:2018, ISO 37001:2016) com pelo menos as cláusulas
  principais para ISO 9001 e ISO 27001 (use as cláusulas e Anexo A
  reais conforme as normas).
- 2 usuários AUDITOR de exemplo
- 2 clientes de exemplo com normas contratadas`));

content.push(h2("B.3 — Autenticação SSO"));
content.push(...codeBlock(`Implemente a autenticação SSO conforme src/lib/auth.ts da seção 5.1
da arquitetura. Crie:
- Página /login com botões Google e Microsoft estilizados como no
  protótipo HTML (dedalo_prototipo.html, página de login)
- Middleware que protege todas as rotas exceto /login e /api/auth
- Redirect pós-login baseado no role do usuário (ADMIN→/dashboard,
  AUDITOR→/minhas-auditorias, FINANCEIRO→/pagamentos)
- Erro amigável quando o usuário não está cadastrado pelo admin
- Teste E2E com Playwright mockando o callback do provedor`));

content.push(h2("B.4 — CRUD de Auditores"));
content.push(...codeBlock(`Crie o módulo de Auditores em src/modules/auditors/ com:
- queries.ts: listAuditors(filters), getAuditor(id)
- actions.ts: createAuditor, updateAuditor, deactivateAuditor,
  uploadCertificate — todas com validação Zod e checagem de role ADMIN
- schema.ts: zod schemas
- Páginas em src/app/(admin)/auditores/ seguindo exatamente o layout
  do protótipo HTML (lista + modal de cadastro)
- Componente CertificatesManager para gerenciar anexos com data de
  validade
- Job Inngest que diariamente alerta certificados vencendo em 60/30/7d
- Testes unitários das actions`));

content.push(h2("B.5 — CRUD de Clientes"));
content.push(...codeBlock(`Espelhe o módulo de auditores para Clientes em src/modules/clients/.
Pontos específicos:
- Periodicidade por norma (anual/semestral/trimestral/custom)
- Geração automática de cronograma sugerido (datas previstas) ao salvar
- Validação: cliente com contrato ainda vigente não pode ser excluído,
  apenas arquivado
- Página de detalhes com timeline visual das auditorias passadas e
  futuras`));

content.push(h2("B.6 — CRUD de Processos"));
content.push(...codeBlock(`Crie o módulo de Processos em src/modules/processos/. Todos os
endpoints exigem role ADMIN.
- queries.ts: listProcessos(filters), getProcesso(id) com contagem de
  controles vinculados
- actions.ts: createProcesso, updateProcesso, inactivateProcesso (NÃO
  permitir excluir se houver vínculos com NormaControle ou Audit)
- schema.ts: zod schema (codigo único, nome obrigatório, categoria
  enum: OPERACIONAL | SUPORTE | GESTAO)
- Página /admin/processos com lista e modal de cadastro
- Página de detalhe mostrando os controles que referenciam o processo
  (com filtro por norma)
- Seed inicial em prisma/seed.ts: pelo menos 8 processos típicos
  (Gestão de RH, Desenvolvimento de Software, Compras, Vendas,
  Atendimento ao Cliente, Gestão de Mudanças, Backup e Recuperação,
  Controles de Acesso)`));

content.push(h2("B.7 — CRUD de Normas e Controles"));
content.push(...codeBlock(`Crie o módulo de Normas em src/modules/normas/:
- CRUD de Norma (codigo, nome, versao, familia, status)
- CRUD hierárquico de NormaControle (parent/children, ordem)
- Vínculo many-to-many de Controle ↔ Processo: na tela de edição de
  controle, multi-select dos processos cadastrados
- Bulk import de controles via CSV (codigo, titulo, descricao,
  parent_codigo, processos)
- Página /admin/normas com lista de normas e drill-down para árvore
  de controles
- Página /admin/normas/[id]/controles/[ctrlId] para editar um controle
  individualmente
- Bloqueio de exclusão se norma ou controle já tem auditoria associada
  (apenas inativar)
- Snapshot do texto do controle no momento da alocação (já tratado em
  AuditChecklistItem)`));

content.push(h2("B.8 — Alocação de Auditorias"));
content.push(...codeBlock(`Crie o módulo de Auditorias em src/modules/audits/:
- createAudit(input) com:
  * Filtragem automática de auditores qualificados pela norma
  * Multi-select dos Processos a serem auditados (carrega os processos
    distintos vinculados aos controles da norma escolhida)
  * Validação RN-05 (warning se certificado vencido)
  * Validação RN-06 (warning ISO 19011 §5.2 se 3+ ciclos consecutivos
    no mesmo cliente)
  * Notificação imediata ao auditor via Resend
  * Registro em AuditLog
- Tela /admin/auditorias com filtros por status (espelhar protótipo)
- Tela /admin/cronograma com visão anual em tabela (mês x cliente)
- Jobs Inngest:
  * remindAuditPlan (30d antes, sem plano)
  * remindAuditClose (15d e 3d antes da auditoria)
  * checkOverdueReports (15d após fim, se sem relatório → ATRASADA)`));

content.push(h2("B.9 — Console do Auditor: Execução da Auditoria"));
content.push(h2("B.9 — Console do Auditor: Execução da Auditoria"));
content.push(...codeBlock(`Implemente a Console do Auditor em src/app/(auditor)/:
- Layout enxuto (sem opções de gestão); sidebar mostra apenas "Minhas
  Auditorias" e "Pagamentos".
- Middleware bloqueia rotas /admin/* para role AUDITOR.
- /minhas-auditorias: lista APENAS auditorias onde leaderId =
  session.user.id OU support inclui o usuário (enforced via RLS no
  banco + filtro Prisma).
- /execucao/[id]:
  * Upload de plano (PDF/DOCX) que notifica admin
  * Sidebar/chips com a lista de Processos selecionados na alocação
    (Audit.processos). O auditor clica em um processo para filtrar o
    checklist. "Todos" como opção default.
  * Carregamento dos controles cujos processos estão na seleção da
    auditoria e respeitam o filtro ativo do auditor.
  * Para cada controle: textarea de evidência, radio de classificação
    ISO 19011, anexos múltiplos, campo de recomendação.
  * Auto-save a cada 5s via Server Action com debounce.
  * Botão "Concluir Auditoria":
    1. Valida que todos os itens (em todos os processos) têm classificação
    2. Dispara job de geração de relatório
    3. Move audit para PENDENTE_RELATORIO
- Visual conforme dedalo_prototipo.html, view "execucao", inclusive
  com o filtro de processos.
- RLS no Postgres garantindo que SELECT/UPDATE em Audit, AuditPlan,
  AuditChecklistItem retornam apenas registros das auditorias do
  usuário.`));

content.push(h2("B.10 — Geração de relatório"));
content.push(...codeBlock(`Implemente src/lib/reports/generate-docx.ts e docx-to-pdf.ts:
- Template Word em public/templates/audit-report.docx com placeholders
  docxtemplater ({cliente}, {#naoConformidades}...{/naoConformidades})
- Server Action generateReport(auditId) gera DOCX, faz upload para
  S3/Supabase e enfileira conversão PDF via Gotenberg
- Gotenberg rodando em container Fly.io ou Render; URL no .env
- Salva AuditReport com versao incrementada
- Tela /admin/auditorias/[id]/relatorio com preview do PDF, botão
  "Aprovar" e "Enviar ao Cliente" (e-mail com link assinado válido por 30d)
- Crie a versão 1 do template Word com layout profissional`));

content.push(h2("B.11 — Pagamentos"));
content.push(...codeBlock(`Implemente src/modules/payments/:
- requestPayment(auditId, valor, nfFile, descricao): só permitido se
  Audit.status === CONCLUIDA e AuditReport.approvedAt != null
- Notifica financeiro@dedalo.com.br via Resend
- Tela /financeiro/pagamentos espelhando o protótipo
- Transições: RECEBIDA -> EM_PROCESSAMENTO -> PAGA/REJEITADA
- Cada transição notifica o auditor`));

content.push(h2("B.12 — Dashboard e polimento"));
content.push(...codeBlock(`Implemente o dashboard em src/app/(admin)/dashboard/:
- KPIs do mês (queries com Prisma)
- Próximas auditorias (limit 5)
- Notificações recentes
- Ocupação por auditor (barras horizontais com Tailwind)
- Banner de alertas (relatórios atrasados, certificados vencendo)
- Dashboards específicos para auditor e financeiro
Em seguida:
- Adicionar Sentry (capturar erros server e client)
- Adicionar tela /admin/trilha-auditoria com filtros
- Adicionar testes E2E Playwright para os 3 fluxos principais
- README.md atualizado com instruções de deploy na Vercel`));

content.push(new Paragraph({ children: [new PageBreak()] }));

// 9. PRÓXIMOS PASSOS
content.push(h1("9. Próximos Passos"));
content.push(numItem("Provisionar contas Vercel, Supabase, Resend, Inngest, Sentry (custo mensal estimado: ~US$ 100)."));
content.push(numItem("Configurar tenants Google Workspace e Microsoft Entra ID para SSO (criar OAuth clients)."));
content.push(numItem("Criar repositório git e fazer commit do CLAUDE.md (Apêndice A)."));
content.push(numItem("Executar a sequência de prompts do Apêndice B no Claude Code, revisando cada entrega."));
content.push(numItem("Realizar testes com usuários internos (2 admins + 3 auditores) antes do go-live."));
content.push(numItem("Deploy em produção após Sprint 4."));

const doc = new Document({
  creator: "Dédalo",
  title: "Sistema de Gestão de Auditorias - Arquitetura Técnica",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: "1F3A5F", font: "Calibri" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: "1F3A5F", font: "Calibri" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "3A6FA0", font: "Calibri" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 },
                          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: "Dédalo • Arquitetura Técnica", color: "888888", size: 18 })],
    })] }) },
    footers: { default: new Footer({ children: [new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
      children: [
        new TextRun({ text: "Arquitetura v1.0", color: "888888", size: 18 }),
        new TextRun({ text: "\tPágina ", color: "888888", size: 18 }),
        new TextRun({ children: [PageNumber.CURRENT], color: "888888", size: 18 }),
      ],
    })] }) },
    children: content,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/sessions/tender-nice-brown/mnt/Sistema de auditoria/dedalo/dedalo_arquitetura.docx", buf);
  console.log("OK");
});
