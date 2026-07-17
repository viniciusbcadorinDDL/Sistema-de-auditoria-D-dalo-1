# Dédalo — Sistema de Gestão de Auditorias

## Sobre o projeto
Sistema interno da Dédalo para gestão do ciclo completo de auditorias:
cadastro de auditores, clientes, normas, controles e processos, alocação,
execução com checklist filtrável por processo, geração de relatórios
DOCX/PDF e fluxo de faturamento dos auditores.

## Stack
- Next.js 15 (App Router) + TypeScript estrito
- Prisma + PostgreSQL (Supabase)
- Auth.js v5 com SSO Google e Microsoft Entra (SEM senhas locais)
- Tailwind CSS + shadcn/ui
- Resend para e-mail, Inngest para jobs agendados
- docxtemplater + Gotenberg para relatórios

## Comandos
- `npm run db:start` — sobe o Postgres LOCAL (porta 5433); deixe o
  terminal aberto. Ver "Ambiente de desenvolvimento local" abaixo.
- `npm run dev` — sobe a aplicação local (em outro terminal)
- `npm run db:migrate` — `prisma migrate dev`
- `npm run db:seed` — popula normas, processos e usuários de teste
- `npm run test` — vitest unitário
- `npm run test:e2e` — playwright
- `npm run lint` — eslint (flat config)
- `npm run typecheck` — `tsc --noEmit`

## Ambiente de desenvolvimento local
- Banco: Postgres portátil via `embedded-postgres` (sem Docker). Os
  dados ficam em `.postgres-data/` (ignorado pelo git). Suba com
  `npm run db:start` e mantenha o terminal aberto; Ctrl+C para parar.
- `DATABASE_URL` aponta para `localhost:5433/dedalo` no `.env`.
- Versões fixadas por compatibilidade com Next 15: **Prisma 6**
  (mantém `url`/`directUrl` no schema), **TypeScript 5.x**,
  **eslint-config-next 15.x**. Não atualizar para Prisma 7 / TS 6 /
  eslint-config-next 16 sem migrar a configuração.
- Migração para Supabase: trocar `DATABASE_URL`/`DIRECT_URL` no `.env`
  e rodar `npm run db:deploy` (`prisma migrate deploy`) + `db:seed`.

## Consoles
O sistema tem DUAS consoles distintas, separadas por route groups:
- `(admin)/` — Console Administrativa: cadastros (auditores, clientes,
  normas, controles, processos), alocação, aprovação de relatórios e
  pagamentos. Acessada por Role=ADMIN.
- `(auditor)/` — Console do Auditor: APENAS execução das auditorias
  alocadas. Sem permissão de criar/editar dados-mestre.

O middleware redireciona o auditor se ele tentar acessar `/admin/*`.

## Convenções
- Sempre usar Server Components por padrão. Marcar `"use client"` só
  quando precisar de interatividade.
- Mutações via Server Actions com validação Zod, NUNCA via fetch direto
  ao banco do cliente.
- Toda escrita no banco gera entrada em AuditLog.
- Strings de UI sempre em pt-BR.
- Arquivos de domínio em `src/modules/<dominio>/` (actions, queries, schema).
- Componentes de UI genéricos em `src/components/ui/`, componentes de
  domínio em `src/components/domain/`.
- Testes unitários ao lado do arquivo: `xxx.test.ts`.
- Commits em português, no padrão Conventional Commits.

## Regras de negócio críticas
1. Auditor só vê auditorias em que é líder ou apoio (enforced via RLS).
2. Admin vê tudo via console `(admin)`.
3. Auditor NÃO cria/edita/exclui normas, controles, processos,
   clientes ou outros auditores. Acesso somente leitura ao catálogo.
4. Solicitação de pagamento exige plano + relatório aprovados.
5. Bloqueio de alocação se certificado do auditor estiver vencido na
   norma (warning sobrescritível com justificativa).
6. Warning de imparcialidade ISO 19011 §5.2 ao alocar 3+ vezes o mesmo
   auditor no mesmo cliente consecutivamente.
7. Relatório atrasado: 15 dias após fim da auditoria.
8. Norma/controle/processo já usado em auditoria existente: apenas
   inativar, nunca excluir.
9. Checklist de auditoria filtra controles pelos processos
   selecionados na alocação (Audit.processos). Se vazio, mostra todos.

## Modelos principais (Prisma)
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

Schema completo em `prisma/schema.prisma` (já provisionado).

## Padrões de prompt
- Antes de criar nova feature, leia o módulo correspondente em
  `src/modules/<dominio>/`.
- Antes de mudar o schema, escreva uma migration; não edite o banco
  manualmente.
- Sempre escreva o teste unitário junto com a action.
- Para gerar PDF, use o helper em `src/lib/reports/`. Não importe
  bibliotecas de PDF diretamente nas pages.
- Para upload de arquivos, use `src/lib/storage.ts`.

## Não fazer
- Não usar localStorage/sessionStorage para dados sensíveis.
- Não logar PII (CPF, CNPJ, e-mail) em texto plano nos logs.
- Não bypass RLS no banco. Se precisar de query admin, usar o
  helper documentado em `src/lib/db.ts`.
- Não usar bibliotecas externas para fazer parsing de DOCX — usar
  apenas docxtemplater.
- Não permitir que auditor crie qualquer registro fora do contexto
  da sua auditoria.

## Documentação completa
- `../dedalo/dedalo_requisitos.docx` — Documento de requisitos funcional
- `../dedalo/dedalo_arquitetura.docx` — Arquitetura técnica detalhada
- `../dedalo/dedalo_prototipo.html` — Protótipo navegável das telas
- `./GUIA_CLAUDE_CODE.md` — Sequência de prompts para construir o MVP
