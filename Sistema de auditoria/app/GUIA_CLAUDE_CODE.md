# Guia de execução com Claude Code

Sequência de prompts para construir o sistema do zero ao MVP.
Execute um por vez: cole no Claude Code, revise as mudanças, rode
`npm run dev` e `npm run typecheck`, faça commit e siga adiante.

---

## Pré-requisitos antes do Prompt B.1

- [ ] Todas as variáveis do `.env.example` preenchidas em um `.env`
- [ ] Conta Supabase criada e DATABASE_URL no `.env`
- [ ] OAuth Client do Google e App do Microsoft Entra com redirect URIs configurados
- [ ] Claude Code instalado: `npm install -g @anthropic-ai/claude-code`
- [ ] Rodar `claude` na pasta `app/` para iniciar a sessão

---

## Sprint 0 — Fundação

### B.1 — Setup inicial

```
Inicialize um projeto Next.js 15 nesta pasta (que já contém CLAUDE.md,
prisma/schema.prisma, .env.example e .gitignore). Use App Router,
TypeScript estrito e Tailwind CSS. Em seguida:

- Adicione shadcn/ui (init com tema neutro, base color slate)
- Instale Prisma e gere o client a partir do schema.prisma existente
  (NÃO sobrescreva o schema)
- Instale Auth.js v5 com providers Google e Microsoft Entra ID
- Instale Resend, @react-email/components
- Instale Inngest e crie src/inngest/client.ts
- Adicione Vitest para testes unitários e Playwright para E2E
- Crie package.json scripts: dev, build, start, lint, typecheck,
  db:migrate (prisma migrate dev), db:seed (tsx prisma/seed.ts),
  test, test:e2e
- Atualize o CLAUDE.md confirmando que os scripts npm estão corretos
- Crie .vscode/settings.json com formatOnSave e editor.defaultFormatter
- Faça o primeiro commit em português: "feat: setup inicial Next.js +
  Prisma + Auth.js"
```

### B.2 — Migration inicial e seed

```
Rode `prisma generate` e `prisma migrate dev --name init` para aplicar
o schema atual ao banco Supabase configurado no .env.

Em seguida crie prisma/seed.ts que popula:

1. 1 usuário ADMIN com meu e-mail (consulte o nome de usuário Git local
   ou pergunte qual e-mail usar)
2. 2 usuários AUDITOR de exemplo
3. 1 usuário FINANCEIRO
4. 10 Processos típicos: RH (Gestão de Recursos Humanos, SUPORTE),
   DEV (Desenvolvimento de Software, OPERACIONAL), COM (Compras e
   Fornecedores, OPERACIONAL), VEN (Vendas e Atendimento, OPERACIONAL),
   TI (Operações de TI & Infra, SUPORTE), BAK (Backup e Recuperação,
   SUPORTE), ACE (Controles de Acesso, SUPORTE), GST (Governança e
   Riscos, GESTAO), QUA (Garantia da Qualidade, OPERACIONAL), FIN
   (Financeiro e Contábil, SUPORTE)
5. Norma "ISO 9001:2015" com TODAS as cláusulas 4 a 10 e principais
   subitens, vinculando cada controle a 1-3 processos relevantes
   (ex: 7.2 "Competência" → RH; 8.4 "Compras" → COM)
6. Norma "ISO 27001:2022" com o Anexo A completo (93 controles)
   vinculando aos processos pertinentes
7. 2 clientes de exemplo com normas contratadas

Adicione `tsx` como dev dependency e configure o script db:seed.
Commit: "feat: schema inicial e seed de normas, processos e usuários".
```

---

## Sprint 1 — Cadastros Mestres e Autenticação

### B.3 — Autenticação SSO + estrutura de consoles

```
Implemente a autenticação SSO:

- src/lib/auth.ts com Auth.js v5, providers Google e Microsoft Entra,
  PrismaAdapter, callback signIn que só permite usuários ativos do banco
- src/lib/db.ts com Prisma client singleton
- src/middleware.ts protegendo todas as rotas exceto /login e /api/auth,
  redirecionando AUDITOR para /minhas-auditorias se tentar /admin/*,
  ADMIN para /dashboard, FINANCEIRO para /pagamentos
- Estrutura de route groups: src/app/(auth)/login, src/app/(admin)/,
  src/app/(auditor)/, src/app/(financeiro)/
- Layouts separados para (admin) e (auditor) com sidebars distintas,
  inspiradas em ../dedalo/dedalo_prototipo.html (badge "Console
  Administrativa" e "Console do Auditor" no topo do sidebar)
- Página /login com botões Google e Microsoft estilizados conforme o
  protótipo
- Mensagem amigável se usuário não estiver cadastrado pelo admin
- Teste E2E Playwright que mocka o callback do provedor

Commit: "feat: autenticação SSO e separação de consoles".
```

### B.4 — CRUD de Processos

```
Crie o módulo de Processos em src/modules/processos/:

- queries.ts: listProcessos(filters), getProcesso(id) com contagem de
  controles vinculados e auditorias em uso
- actions.ts: createProcesso, updateProcesso, inactivateProcesso (NÃO
  permitir excluir se houver vínculos com NormaControle ou Audit)
- schema.ts: zod schema (codigo único, nome obrigatório, categoria enum)
- Todas as actions exigem role ADMIN e registram em AuditLog

Páginas em src/app/(admin)/processos/:
- /processos: lista com busca e filtro por categoria, conforme protótipo
- /processos/[id]: detalhes mostrando os controles que referenciam o
  processo (com filtro por norma) e auditorias em andamento que usam
- Modal de criação/edição como no protótipo

Testes unitários das actions.
Commit: "feat: cadastro de processos".
```

### B.5 — CRUD de Normas e Controles

```
Crie o módulo de Normas em src/modules/normas/:

- CRUD de Norma (codigo, nome, versao, familia, status)
- CRUD hierárquico de NormaControle (parent/children, ordem)
- Vínculo many-to-many de Controle ↔ Processo (multi-select na edição
  do controle, mostrando todos os Processos ativos)
- Bulk import de controles via CSV (codigo, titulo, descricao,
  parent_codigo, processos_codigos separados por ponto-e-vírgula)

Páginas em src/app/(admin)/normas/:
- /normas: lista de normas
- /normas/[id]: árvore drill-down dos controles, conforme protótipo
- /normas/[id]/controles/[ctrlId]: edição de controle individual
- Botão "Importar CSV" com preview antes de confirmar

Regras:
- Bloqueio de exclusão se norma/controle já tem auditoria associada
  (apenas inativar — usar campo ativo)
- AuditLog em todas as mutações

Commit: "feat: cadastro de normas e controles com vínculo a processos".
```

### B.6 — CRUD de Auditores

```
Crie o módulo de Auditores em src/modules/auditors/:

- queries.ts: listAuditors(filters: { norma?, status?, search? }),
  getAuditor(id), getAvailableAuditors(normaId, dataInicio, dataFim)
- actions.ts: createAuditor (cria User + Auditor), updateAuditor,
  deactivateAuditor, uploadCertificate, deleteCertificate
- schema.ts: zod schemas com validação de CPF e CNPJ
- Todas as actions exigem role ADMIN

Páginas em src/app/(admin)/auditores/ conforme protótipo:
- Lista com filtros e busca
- Modal de cadastro
- Página de detalhes com aba "Certificados" mostrando vigência

Componente CertificatesManager para upload com tipo, emissão, validade
(usa src/lib/storage.ts).

Job Inngest que diariamente verifica certificados vencendo em 60, 30 e
7 dias e dispara notificação ao auditor e ao admin.

Commit: "feat: cadastro de auditores e alerta de certificados".
```

### B.7 — CRUD de Clientes

```
Crie o módulo de Clientes em src/modules/clients/:

- queries, actions, schema (padrão dos outros módulos)
- Periodicidade por norma (anual/semestral/trimestral/custom)
- Geração automática de cronograma sugerido ao salvar (datas previstas
  por norma com base na periodicidade)
- Validação: cliente com contrato ainda vigente E auditorias em
  status diferente de CONCLUIDA/CANCELADA não pode ser excluído,
  apenas arquivado (campo archived)

Páginas em src/app/(admin)/clientes/ conforme protótipo:
- Lista
- Página de detalhes com timeline visual das auditorias passadas e
  futuras

Job Inngest: alerta 90 dias antes do vencimento do contrato.

Commit: "feat: cadastro de clientes e cronograma sugerido".
```

---

## Sprint 2 — Alocação e Cronograma

### B.8 — Alocação de Auditorias

```
Crie o módulo de Auditorias em src/modules/audits/:

- createAudit(input):
  * Filtragem automática de auditores qualificados pela norma
  * Multi-select dos Processos a auditar (carrega os processos
    distintos vinculados aos controles da norma escolhida)
  * Validação RN-05: warning se certificado do auditor vencido
  * Validação RN-06: warning ISO 19011 §5.2 se 3+ ciclos consecutivos
    no mesmo cliente — exige justificativa para sobrescrever
  * Gera número sequencial (AAAA-NNN)
  * Cria AuditChecklistItem com snapshot dos controles filtrados pelos
    processos selecionados (RN-13 e RN-14)
  * Notifica auditor via Resend (template react-email)
  * Registra em AuditLog

- updateAudit, cancelAudit, reassignLeader

Páginas em src/app/(admin)/auditorias/ conforme protótipo:
- Lista com tabs por status
- Modal "Nova Auditoria" com seleção de processos
- Página de detalhes da auditoria

Página /admin/cronograma com visão anual mês x cliente.

Jobs Inngest:
- remindAuditPlan: roda diariamente, notifica auditor 30d antes da
  auditoria se ainda não tem plano
- remindAuditClose: 15d e 3d antes da auditoria
- checkOverdueReports: 15d após fim da auditoria, muda status para
  ATRASADA se sem relatório aprovado

Commit: "feat: alocação de auditorias e jobs de lembrete".
```

---

## Sprint 3 — Console do Auditor: Execução e Relatório

### B.9 — Console do Auditor: Execução

```
Implemente a Console do Auditor em src/app/(auditor)/:

- Layout enxuto: sidebar mostra apenas "Minhas Auditorias",
  "Pagamentos" e "Notificações". Badge "Console do Auditor".
- /minhas-auditorias: lista APENAS auditorias onde session.user.id é
  leaderId ou está em support (filtro Prisma + RLS no Postgres)
- /execucao/[id]:
  * Upload de plano (PDF/DOCX) → notifica admin
  * Filtro de processos visível no topo (chips conforme protótipo) com
    a lista de processos da Audit.processos. Default: "Todos".
  * Checklist renderizado dos AuditChecklistItem filtrados pelo
    processo ativo
  * Para cada item: textarea de evidência, radio de classificação
    ISO 19011, anexos múltiplos, campo de recomendação
  * Auto-save a cada 5s via Server Action com debounce
  * Botão "Concluir Auditoria":
    - Valida que todos os itens (em todos os processos) têm classificação
    - Dispara job Inngest de geração de relatório
    - Move audit para PENDENTE_RELATORIO

Habilite Row Level Security no Postgres com policies que filtram Audit,
AuditPlan, AuditChecklistItem por leaderId/support do usuário. Crie a
migration SQL correspondente.

Visual conforme ../dedalo/dedalo_prototipo.html view "execucao".

Commit: "feat: console do auditor com execução filtrada por processo".
```

### B.10 — Geração de Relatório DOCX/PDF

```
Implemente src/lib/reports/:

- generate-docx.ts usando docxtemplater + pizzip
- docx-to-pdf.ts chamando o Gotenberg (GOTENBERG_URL do .env)
- Template em public/templates/audit-report.docx com placeholders
  docxtemplater ({cliente}, {norma}, {leader}, {data},
  {#processos}{nome}{/processos}, {#naoConformidades}{codigo} —
  {titulo}: {evidencia}{/naoConformidades}, etc.)

Crie a versão 1 do template com layout profissional (capa, sumário
executivo, lista de processos auditados, conformidades, não
conformidades por classificação, recomendações).

Job Inngest generateReport(auditId):
- Lê audit + checklist completo
- Renderiza DOCX
- Faz upload no Supabase Storage (path: reports/{numero}/v{versao}.docx)
- Chama Gotenberg para converter em PDF
- Salva AuditReport com URLs
- Notifica admin para aprovação

Tela /admin/auditorias/[id]/relatorio:
- Preview do PDF embedded
- Botões "Aprovar" e "Enviar ao Cliente" (gera signed URL válida 30d
  e envia e-mail com link)
- Histórico de versões

Commit: "feat: geração de relatório DOCX/PDF e aprovação".
```

---

## Sprint 4 — Pagamentos, Dashboard e Polimento

### B.11 — Solicitação de Pagamento

```
Implemente src/modules/payments/:

- requestPayment(auditId, valor, nfFile, descricao):
  * Permitido apenas se Audit.status === CONCLUIDA e
    AuditReport.approvedAt != null
  * Permitido apenas se session.user.id === audit.leaderId
  * Upload da NF no Supabase Storage
  * Notifica EMAIL_FINANCEIRO via Resend
- updatePaymentStatus para FINANCEIRO: RECEBIDA → EM_PROCESSAMENTO
  → PAGA / REJEITADA (com motivo). Cada transição notifica o auditor.
- RN-11: valor não pode ser editado após EM_PROCESSAMENTO

Telas:
- /auditor/pagamentos: minhas solicitações (auditor)
- /financeiro/pagamentos: todas (financeiro) conforme protótipo
- Modal "Solicitar Pagamento" no console do auditor

Commit: "feat: fluxo de solicitação e processamento de pagamento".
```

### B.12 — Dashboard, alertas e polimento

```
Implemente:

- /admin/dashboard com KPIs do mês (auditorias planejadas, em
  execução, concluídas, atrasadas, pagamentos), próximas auditorias,
  notificações recentes, ocupação por auditor (barras Tailwind),
  banner de alertas (relatórios atrasados, certificados vencendo,
  contratos a renovar) — espelhar protótipo
- /auditor/dashboard com versão enxuta (minhas próximas, meus pagamentos)
- /financeiro/dashboard com KPIs de pagamento

Adicione:
- Sentry capturando erros server e client
- /admin/trilha-auditoria com filtros (entidade, usuário, período)
- Testes E2E Playwright para 3 fluxos: cadastro de auditor, alocação
  + execução completa de auditoria, solicitação de pagamento
- README.md final com instruções de deploy na Vercel
- Workflow GitHub Actions: typecheck + test + build em PR

Faça deploy de teste na Vercel e valide os 3 fluxos.

Commit: "feat: dashboard, alertas e testes E2E (MVP completo)".
```

---

## Pós-MVP

Quando o MVP estiver estável, considere:
- Assinatura digital nos relatórios (ICP-Brasil)
- Portal do cliente (somente leitura)
- Plano de ação e auditoria de acompanhamento
- Pesquisa de satisfação automática
- App mobile (PWA primeiro, nativo depois)
