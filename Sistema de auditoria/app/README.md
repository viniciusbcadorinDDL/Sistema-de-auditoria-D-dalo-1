# Dédalo — Sistema de Gestão de Auditorias

Plataforma interna para gestão do ciclo completo de auditorias da Dédalo.

## Pré-requisitos

- Node.js 20+ e npm
- Conta GitHub
- Conta Vercel
- Projeto Supabase (Postgres + Storage)
- Conta Resend (e-mail transacional)
- Conta Inngest (jobs agendados)
- Conta Sentry (observabilidade)
- OAuth Client no Google Cloud (Workspace)
- App registration no Microsoft Entra ID
- Container Gotenberg rodando (Fly.io ou Render)
- Claude Code instalado globalmente:
  `npm install -g @anthropic-ai/claude-code`

## Setup inicial

1. Copie `.env.example` para `.env` e preencha todas as variáveis.
2. Abra esta pasta em um terminal e rode:
   ```bash
   claude
   ```
3. No Claude Code, abra `GUIA_CLAUDE_CODE.md` e cole o **Prompt B.1**.
   Aguarde a inicialização do projeto Next.js + Prisma.
4. Após cada prompt, revise as mudanças, rode `npm run dev` para validar,
   faça `git commit` e passe para o próximo.

## Estrutura prevista após Sprint 1

```
app/
├── CLAUDE.md                       # contexto persistente do projeto
├── GUIA_CLAUDE_CODE.md             # 12 prompts em sequência
├── README.md                       # este arquivo
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma               # já provisionado
│   ├── migrations/
│   └── seed.ts
├── public/
│   └── templates/
│       └── audit-report.docx
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (admin)/                # Console Administrativa
│   │   │   ├── dashboard/
│   │   │   ├── auditores/
│   │   │   ├── clientes/
│   │   │   ├── normas/
│   │   │   ├── processos/
│   │   │   ├── auditorias/
│   │   │   ├── cronograma/
│   │   │   └── configuracoes/
│   │   ├── (auditor)/              # Console do Auditor
│   │   │   ├── minhas-auditorias/
│   │   │   └── execucao/[id]/
│   │   ├── (financeiro)/pagamentos/
│   │   └── api/
│   ├── components/{ui,domain}/
│   ├── lib/{db,auth,email,storage,reports,rbac}/
│   ├── modules/{auditors,clients,normas,processos,audits,payments}/
│   └── inngest/
└── tests/{unit,e2e}/
```

## Cronograma sugerido

| Sprint | Duração | Entregas |
|---|---|---|
| 0 | 3-5 dias | Provisionamento de contas, setup do projeto |
| 1 | 2 semanas | Cadastros mestres + autenticação SSO |
| 2 | 2 semanas | Alocação e cronograma |
| 3 | 2 semanas | Console do Auditor: execução + relatório |
| 4 | 2 semanas | Pagamentos + dashboard + polimento |

## Deploy

- Push para `main` → Vercel publica em produção.
- Push para qualquer branch → Vercel cria preview URL.
- Migrations rodam automaticamente via `prisma migrate deploy` no build step.

## Suporte

Documentação técnica completa em:
- `../dedalo/dedalo_requisitos.docx`
- `../dedalo/dedalo_arquitetura.docx`
- `../dedalo/dedalo_prototipo.html`
