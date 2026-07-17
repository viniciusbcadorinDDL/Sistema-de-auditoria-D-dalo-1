/**
 * Seed do Dédalo — popula usuários, processos, normas (ISO 9001:2015 e
 * ISO 27001:2022 com o Anexo A completo) e clientes de exemplo.
 *
 * Idempotente: limpa as tabelas semeáveis e recria tudo do zero.
 * Rode com: npm run db:seed
 */
import { PrismaClient, ProcessoCategoria, Role, SSOProvider } from "@prisma/client";

const db = new PrismaClient();

// ============ Processos ============
const PROCESSOS: {
  codigo: string;
  nome: string;
  categoria: ProcessoCategoria;
  descricao: string;
}[] = [
  { codigo: "RH", nome: "Gestão de Recursos Humanos", categoria: "SUPORTE", descricao: "Recrutamento, treinamento, competência e gestão de pessoas." },
  { codigo: "DEV", nome: "Desenvolvimento de Software", categoria: "OPERACIONAL", descricao: "Projeto, codificação e entrega de software." },
  { codigo: "COM", nome: "Compras e Fornecedores", categoria: "OPERACIONAL", descricao: "Aquisição de bens e serviços e gestão de fornecedores." },
  { codigo: "VEN", nome: "Vendas e Atendimento", categoria: "OPERACIONAL", descricao: "Relacionamento com clientes, propostas e atendimento." },
  { codigo: "TI", nome: "Operações de TI & Infraestrutura", categoria: "SUPORTE", descricao: "Infraestrutura, redes, servidores e operações de TI." },
  { codigo: "BAK", nome: "Backup e Recuperação", categoria: "SUPORTE", descricao: "Cópias de segurança, redundância e recuperação de dados." },
  { codigo: "ACE", nome: "Controles de Acesso", categoria: "SUPORTE", descricao: "Gestão de identidades, autenticação e autorização." },
  { codigo: "GST", nome: "Governança e Riscos", categoria: "GESTAO", descricao: "Governança, gestão de riscos, políticas e conformidade." },
  { codigo: "QUA", nome: "Garantia da Qualidade", categoria: "OPERACIONAL", descricao: "Controle de qualidade, auditorias internas e melhoria." },
  { codigo: "FIN", nome: "Financeiro e Contábil", categoria: "SUPORTE", descricao: "Gestão financeira, contábil e fiscal." },
];

// ============ ISO 9001:2015 — cláusulas 4 a 10 ============
// [codigo, titulo, [processos]]
type Ctrl = [string, string, string[]];
const ISO9001: { pai: Ctrl; filhos: Ctrl[] }[] = [
  {
    pai: ["4", "Contexto da organização", ["GST"]],
    filhos: [
      ["4.1", "Entendendo a organização e seu contexto", ["GST"]],
      ["4.2", "Entendendo as necessidades e expectativas de partes interessadas", ["GST", "VEN"]],
      ["4.3", "Determinando o escopo do sistema de gestão da qualidade", ["GST", "QUA"]],
      ["4.4", "Sistema de gestão da qualidade e seus processos", ["QUA", "GST"]],
    ],
  },
  {
    pai: ["5", "Liderança", ["GST"]],
    filhos: [
      ["5.1", "Liderança e comprometimento", ["GST"]],
      ["5.2", "Política", ["GST", "QUA"]],
      ["5.3", "Papéis, responsabilidades e autoridades organizacionais", ["GST", "RH"]],
    ],
  },
  {
    pai: ["6", "Planejamento", ["GST", "QUA"]],
    filhos: [
      ["6.1", "Ações para abordar riscos e oportunidades", ["GST"]],
      ["6.2", "Objetivos da qualidade e planejamento para alcançá-los", ["QUA", "GST"]],
      ["6.3", "Planejamento de mudanças", ["QUA"]],
    ],
  },
  {
    pai: ["7", "Apoio", ["RH", "QUA"]],
    filhos: [
      ["7.1", "Recursos", ["GST", "TI"]],
      ["7.2", "Competência", ["RH"]],
      ["7.3", "Conscientização", ["RH"]],
      ["7.4", "Comunicação", ["GST"]],
      ["7.5", "Informação documentada", ["QUA"]],
    ],
  },
  {
    pai: ["8", "Operação", ["QUA"]],
    filhos: [
      ["8.1", "Planejamento e controle operacionais", ["QUA"]],
      ["8.2", "Requisitos para produtos e serviços", ["VEN"]],
      ["8.3", "Projeto e desenvolvimento de produtos e serviços", ["DEV"]],
      ["8.4", "Controle de processos, produtos e serviços providos externamente", ["COM"]],
      ["8.5", "Produção e provisão de serviço", ["QUA", "DEV"]],
      ["8.6", "Liberação de produtos e serviços", ["QUA"]],
      ["8.7", "Controle de saídas não conformes", ["QUA"]],
    ],
  },
  {
    pai: ["9", "Avaliação de desempenho", ["QUA", "GST"]],
    filhos: [
      ["9.1", "Monitoramento, medição, análise e avaliação", ["QUA"]],
      ["9.2", "Auditoria interna", ["QUA"]],
      ["9.3", "Análise crítica pela direção", ["GST"]],
    ],
  },
  {
    pai: ["10", "Melhoria", ["QUA"]],
    filhos: [
      ["10.1", "Generalidades", ["QUA"]],
      ["10.2", "Não conformidade e ação corretiva", ["QUA"]],
      ["10.3", "Melhoria contínua", ["QUA"]],
    ],
  },
];

// ============ ISO 27001:2022 — Anexo A (93 controles) ============
const ISO27001: { pai: Ctrl; filhos: Ctrl[] }[] = [
  {
    pai: ["5", "Controles organizacionais", ["GST"]],
    filhos: [
      ["5.1", "Políticas de segurança da informação", ["GST"]],
      ["5.2", "Funções e responsabilidades pela segurança da informação", ["GST", "RH"]],
      ["5.3", "Segregação de funções", ["GST", "ACE"]],
      ["5.4", "Responsabilidades da direção", ["GST"]],
      ["5.5", "Contato com autoridades", ["GST"]],
      ["5.6", "Contato com grupos de interesse especial", ["GST"]],
      ["5.7", "Inteligência de ameaças", ["TI", "GST"]],
      ["5.8", "Segurança da informação no gerenciamento de projetos", ["GST", "DEV"]],
      ["5.9", "Inventário de informações e outros ativos associados", ["TI", "GST"]],
      ["5.10", "Uso aceitável de informações e outros ativos associados", ["GST", "TI"]],
      ["5.11", "Devolução de ativos", ["RH", "TI"]],
      ["5.12", "Classificação das informações", ["GST"]],
      ["5.13", "Rotulagem de informações", ["GST"]],
      ["5.14", "Transferência de informações", ["TI", "GST"]],
      ["5.15", "Controle de acesso", ["ACE"]],
      ["5.16", "Gestão de identidade", ["ACE"]],
      ["5.17", "Informações de autenticação", ["ACE"]],
      ["5.18", "Direitos de acesso", ["ACE"]],
      ["5.19", "Segurança da informação nas relações com fornecedores", ["COM"]],
      ["5.20", "Abordagem da segurança da informação em acordos com fornecedores", ["COM"]],
      ["5.21", "Gestão da segurança da informação na cadeia de fornecimento de TIC", ["COM", "TI"]],
      ["5.22", "Monitoramento, análise crítica e gestão de mudanças de serviços de fornecedores", ["COM", "TI"]],
      ["5.23", "Segurança da informação para uso de serviços em nuvem", ["TI"]],
      ["5.24", "Planejamento e preparação da gestão de incidentes de segurança da informação", ["TI", "GST"]],
      ["5.25", "Avaliação e decisão sobre eventos de segurança da informação", ["TI"]],
      ["5.26", "Resposta a incidentes de segurança da informação", ["TI"]],
      ["5.27", "Aprendizado com incidentes de segurança da informação", ["TI", "GST"]],
      ["5.28", "Coleta de evidências", ["TI"]],
      ["5.29", "Segurança da informação durante disrupção", ["TI", "BAK"]],
      ["5.30", "Prontidão de TIC para continuidade de negócios", ["TI", "BAK"]],
      ["5.31", "Requisitos legais, estatutários, regulamentares e contratuais", ["GST"]],
      ["5.32", "Direitos de propriedade intelectual", ["GST"]],
      ["5.33", "Proteção de registros", ["GST", "TI"]],
      ["5.34", "Privacidade e proteção de dados pessoais (DP)", ["GST"]],
      ["5.35", "Análise crítica independente da segurança da informação", ["QUA", "GST"]],
      ["5.36", "Conformidade com políticas, regras e normas de segurança da informação", ["GST", "QUA"]],
      ["5.37", "Procedimentos operacionais documentados", ["TI", "QUA"]],
    ],
  },
  {
    pai: ["6", "Controles de pessoas", ["RH"]],
    filhos: [
      ["6.1", "Triagem", ["RH"]],
      ["6.2", "Termos e condições de contratação", ["RH"]],
      ["6.3", "Conscientização, educação e treinamento em segurança da informação", ["RH"]],
      ["6.4", "Processo disciplinar", ["RH"]],
      ["6.5", "Responsabilidades após encerramento ou mudança de contratação", ["RH"]],
      ["6.6", "Acordos de confidencialidade ou não divulgação", ["RH", "GST"]],
      ["6.7", "Trabalho remoto", ["RH", "TI"]],
      ["6.8", "Relato de eventos de segurança da informação", ["RH", "TI"]],
    ],
  },
  {
    pai: ["7", "Controles físicos", ["TI"]],
    filhos: [
      ["7.1", "Perímetros de segurança física", ["TI"]],
      ["7.2", "Entrada física", ["TI", "ACE"]],
      ["7.3", "Segurança de escritórios, salas e instalações", ["TI"]],
      ["7.4", "Monitoramento de segurança física", ["TI"]],
      ["7.5", "Proteção contra ameaças físicas e ambientais", ["TI"]],
      ["7.6", "Trabalho em áreas seguras", ["TI"]],
      ["7.7", "Mesa limpa e tela limpa", ["TI", "GST"]],
      ["7.8", "Localização e proteção de equipamentos", ["TI"]],
      ["7.9", "Segurança de ativos fora das instalações", ["TI"]],
      ["7.10", "Mídia de armazenamento", ["TI", "BAK"]],
      ["7.11", "Utilidades de suporte", ["TI"]],
      ["7.12", "Segurança do cabeamento", ["TI"]],
      ["7.13", "Manutenção de equipamentos", ["TI"]],
      ["7.14", "Descarte seguro ou reutilização de equipamentos", ["TI"]],
    ],
  },
  {
    pai: ["8", "Controles tecnológicos", ["TI"]],
    filhos: [
      ["8.1", "Dispositivos endpoint de usuário", ["TI"]],
      ["8.2", "Direitos de acesso privilegiado", ["ACE"]],
      ["8.3", "Restrição de acesso à informação", ["ACE"]],
      ["8.4", "Acesso ao código-fonte", ["DEV", "ACE"]],
      ["8.5", "Autenticação segura", ["ACE"]],
      ["8.6", "Gestão de capacidade", ["TI"]],
      ["8.7", "Proteção contra malware", ["TI"]],
      ["8.8", "Gestão de vulnerabilidades técnicas", ["TI", "DEV"]],
      ["8.9", "Gestão de configuração", ["TI"]],
      ["8.10", "Exclusão de informações", ["TI"]],
      ["8.11", "Mascaramento de dados", ["TI", "DEV"]],
      ["8.12", "Prevenção de vazamento de dados", ["TI"]],
      ["8.13", "Backup de informações", ["BAK"]],
      ["8.14", "Redundância de recursos de processamento de informações", ["BAK", "TI"]],
      ["8.15", "Registro de logs", ["TI"]],
      ["8.16", "Atividades de monitoramento", ["TI"]],
      ["8.17", "Sincronização de relógios", ["TI"]],
      ["8.18", "Uso de programas utilitários privilegiados", ["TI", "ACE"]],
      ["8.19", "Instalação de software em sistemas operacionais", ["TI"]],
      ["8.20", "Segurança de redes", ["TI"]],
      ["8.21", "Segurança de serviços de rede", ["TI"]],
      ["8.22", "Segregação de redes", ["TI"]],
      ["8.23", "Filtragem da web", ["TI"]],
      ["8.24", "Uso de criptografia", ["TI", "DEV"]],
      ["8.25", "Ciclo de vida de desenvolvimento seguro", ["DEV"]],
      ["8.26", "Requisitos de segurança de aplicações", ["DEV"]],
      ["8.27", "Princípios de arquitetura e engenharia de sistemas seguros", ["DEV"]],
      ["8.28", "Codificação segura", ["DEV"]],
      ["8.29", "Testes de segurança em desenvolvimento e aceitação", ["DEV", "QUA"]],
      ["8.30", "Desenvolvimento terceirizado", ["DEV", "COM"]],
      ["8.31", "Separação dos ambientes de desenvolvimento, teste e produção", ["DEV", "TI"]],
      ["8.32", "Gestão de mudanças", ["TI", "DEV"]],
      ["8.33", "Informações de teste", ["DEV", "QUA"]],
      ["8.34", "Proteção de sistemas de informação durante testes de auditoria", ["TI", "QUA"]],
    ],
  },
];

async function wipe() {
  await db.auditLog.deleteMany();
  await db.notification.deleteMany();
  await db.paymentRequest.deleteMany();
  await db.auditAttachment.deleteMany();
  await db.auditChecklistItem.deleteMany();
  await db.auditPlan.deleteMany();
  await db.auditReport.deleteMany();
  await db.audit.deleteMany();
  await db.clientAttachment.deleteMany();
  await db.clientNorma.deleteMany();
  await db.client.deleteMany();
  await db.auditorCertificate.deleteMany();
  // controles: filhos antes dos pais (auto-relação)
  await db.normaControle.deleteMany({ where: { parentId: { not: null } } });
  await db.normaControle.deleteMany();
  await db.norma.deleteMany();
  await db.processo.deleteMany();
  await db.auditor.deleteMany();
  await db.user.deleteMany();
}

async function main() {
  console.log("→ Limpando dados existentes...");
  await wipe();

  // ---- Processos ----
  console.log("→ Criando processos...");
  const processoMap = new Map<string, string>();
  for (const p of PROCESSOS) {
    const created = await db.processo.create({ data: p });
    processoMap.set(p.codigo, created.id);
  }
  const connectProcessos = (codes: string[]) => ({
    connect: codes.map((c) => ({ id: processoMap.get(c)! })),
  });

  // ---- Normas + controles ----
  async function seedNorma(
    codigo: string,
    nome: string,
    versao: string,
    familia: string,
    grupos: { pai: Ctrl; filhos: Ctrl[] }[],
  ) {
    console.log(`→ Criando norma ${codigo}...`);
    const norma = await db.norma.create({
      data: { codigo, nome, versao, familia, status: "ATIVA" },
    });
    let ordem = 0;
    for (const grupo of grupos) {
      const [pCod, pTit, pProc] = grupo.pai;
      const pai = await db.normaControle.create({
        data: {
          normaId: norma.id,
          codigo: pCod,
          titulo: pTit,
          descricao: pTit,
          ordem: ordem++,
          processos: pProc.length ? connectProcessos(pProc) : undefined,
        },
      });
      for (const [cCod, cTit, cProc] of grupo.filhos) {
        await db.normaControle.create({
          data: {
            normaId: norma.id,
            parentId: pai.id,
            codigo: cCod,
            titulo: cTit,
            descricao: cTit,
            ordem: ordem++,
            processos: cProc.length ? connectProcessos(cProc) : undefined,
          },
        });
      }
    }
    const total = await db.normaControle.count({ where: { normaId: norma.id } });
    console.log(`  ${codigo}: ${total} controles.`);
    return norma;
  }

  const iso9001 = await seedNorma(
    "ISO 9001:2015",
    "Sistemas de gestão da qualidade — Requisitos",
    "2015",
    "ISO 9000",
    ISO9001,
  );
  const iso27001 = await seedNorma(
    "ISO 27001:2022",
    "Segurança da informação, segurança cibernética e proteção à privacidade — Sistemas de gestão da segurança da informação — Requisitos",
    "2022",
    "ISO 27000",
    ISO27001,
  );

  // ---- Usuários ----
  console.log("→ Criando usuários...");
  await db.user.create({
    data: {
      email: "pr330419@gmail.com",
      name: "Administrador Dédalo",
      role: Role.ADMIN,
      ssoProvider: SSOProvider.GOOGLE,
      ssoSubject: "seed-admin",
      active: true,
    },
  });

  await db.user.create({
    data: {
      email: "financeiro@dedalo.com.br",
      name: "Equipe Financeira",
      role: Role.FINANCEIRO,
      ssoProvider: SSOProvider.MICROSOFT,
      ssoSubject: "seed-financeiro",
      active: true,
    },
  });

  const auditoresSeed = [
    {
      email: "ana.lima@dedalo.com.br",
      name: "Ana Lima",
      cpf: "111.444.777-35",
      provider: SSOProvider.GOOGLE,
      sub: "seed-auditor-ana",
    },
    {
      email: "bruno.souza@dedalo.com.br",
      name: "Bruno Souza",
      cpf: "529.982.247-25",
      provider: SSOProvider.MICROSOFT,
      sub: "seed-auditor-bruno",
    },
  ];

  for (const a of auditoresSeed) {
    await db.user.create({
      data: {
        email: a.email,
        name: a.name,
        role: Role.AUDITOR,
        ssoProvider: a.provider,
        ssoSubject: a.sub,
        active: true,
        auditor: {
          create: {
            cpf: a.cpf,
            phone: "(11) 90000-0000",
            dailyRate: 1500,
            normas: { connect: [{ id: iso9001.id }, { id: iso27001.id }] },
          },
        },
      },
    });
  }

  // ---- Clientes ----
  console.log("→ Criando clientes...");
  const hoje = new Date();
  const umAnoDepois = new Date(hoje);
  umAnoDepois.setFullYear(hoje.getFullYear() + 1);

  await db.client.create({
    data: {
      razaoSocial: "TechNova Sistemas Ltda.",
      nomeFantasia: "TechNova",
      cnpj: "12.345.678/0001-90",
      setor: "Tecnologia da Informação",
      porte: "Médio",
      numColaboradores: 180,
      contacts: [
        { nome: "Carla Mendes", cargo: "Gerente de Qualidade", email: "carla@technova.com.br", telefone: "(11) 3000-1000" },
      ],
      contractStart: hoje,
      contractEnd: umAnoDepois,
      contractValue: 48000,
      normas: {
        create: [
          { normaId: iso9001.id, periodicidade: "ANUAL" },
          { normaId: iso27001.id, periodicidade: "ANUAL" },
        ],
      },
    },
  });

  await db.client.create({
    data: {
      razaoSocial: "Indústria Aurora S.A.",
      nomeFantasia: "Aurora",
      cnpj: "98.765.432/0001-10",
      setor: "Manufatura",
      porte: "Grande",
      numColaboradores: 640,
      contacts: [
        { nome: "Roberto Dias", cargo: "Diretor de Operações", email: "roberto@aurora.ind.br", telefone: "(19) 3500-2000" },
      ],
      contractStart: hoje,
      contractEnd: umAnoDepois,
      contractValue: 72000,
      normas: {
        create: [{ normaId: iso9001.id, periodicidade: "SEMESTRAL" }],
      },
    },
  });

  // ---- Resumo ----
  const counts = {
    usuarios: await db.user.count(),
    auditores: await db.auditor.count(),
    processos: await db.processo.count(),
    normas: await db.norma.count(),
    controles: await db.normaControle.count(),
    clientes: await db.client.count(),
  };
  console.log("\n✓ Seed concluído:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
