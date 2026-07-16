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

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  children: [new TextRun(text)],
});
const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 160 },
  children: [new TextRun(text)],
});
const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 220, after: 120 },
  children: [new TextRun(text)],
});
const bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: 80 },
  children: Array.isArray(text) ? text : [new TextRun(text)],
});
const numItem = (text) => new Paragraph({
  numbering: { reference: "numbers", level: 0 },
  spacing: { after: 80 },
  children: Array.isArray(text) ? text : [new TextRun(text)],
});

const headerCell = (text, width) => new TableCell({
  borders,
  width: { size: width, type: WidthType.DXA },
  shading: { fill: "1F3A5F", type: ShadingType.CLEAR, color: "auto" },
  margins: cellMargins,
  children: [new Paragraph({
    children: [new TextRun({ text, bold: true, color: "FFFFFF" })],
  })],
});

const dataCell = (text, width) => new TableCell({
  borders,
  width: { size: width, type: WidthType.DXA },
  margins: cellMargins,
  children: [new Paragraph({ children: [new TextRun(text)] })],
});

const tableFromRows = (headers, rows, widths) => new Table({
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: widths,
  rows: [
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => headerCell(h, widths[i])),
    }),
    ...rows.map(row => new TableRow({
      children: row.map((cell, i) => dataCell(cell, widths[i])),
    })),
  ],
});

const content = [];

// COVER
content.push(new Paragraph({ spacing: { before: 2400, after: 240 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "DÉDALO", bold: true, size: 56, color: "1F3A5F" })] }));
content.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 480 },
  children: [new TextRun({ text: "Sistema de Gestão de Auditorias", size: 36, color: "1F3A5F" })] }));
content.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 },
  children: [new TextRun({ text: "Documento de Requisitos Funcionais", size: 28, italics: true })] }));
content.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1200 },
  children: [new TextRun({ text: "Versão 1.0  •  Junho de 2026", size: 22, color: "666666" })] }));
content.push(new Paragraph({ alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Preparado para: Marcos Gomes", size: 22 })] }));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("Sumário"));
content.push(new TableOfContents("Sumário", { hyperlink: true, headingStyleRange: "1-3" }));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("1. Introdução"));
content.push(h2("1.1. Contexto"));
content.push(p("A Dédalo é uma empresa que presta serviços de auditoria interna para múltiplos clientes, atendendo a diferentes normas (ISO 9001, ISO 27001, ISO 14001, ISO 45001, ISO 37001, entre outras). A operação atual envolve a gestão de uma equipe distribuída de auditores e a execução de ciclos auditoriais periódicos junto aos clientes contratantes."));
content.push(p("Este documento especifica os requisitos funcionais e não funcionais de uma plataforma web destinada a centralizar o ciclo completo de auditoria: do cadastro de auditores e clientes à execução da auditoria, geração de relatórios e solicitação de pagamento."));
content.push(h2("1.2. Objetivos do Sistema"));
content.push(bullet("Centralizar o cadastro de auditores, clientes, normas, controles e processos auditáveis."));
content.push(bullet("Automatizar a alocação de auditores às auditorias e o envio de notificações em todas as etapas do ciclo."));
content.push(bullet("Padronizar a execução da auditoria diretamente no sistema, eliminando o uso de planilhas avulsas."));
content.push(bullet("Permitir ao auditor filtrar a execução por processo (ex.: RH, Desenvolvimento, Compras), agilizando o trabalho em campo."));
content.push(bullet("Gerar relatórios de auditoria em Word e PDF prontos para envio ao cliente."));
content.push(bullet("Controlar o fluxo de faturamento dos auditores via emissão de Nota Fiscal."));
content.push(bullet("Garantir segurança e rastreabilidade por meio de SSO corporativo (Google e Microsoft) e separação clara entre console administrativa e console do auditor."));
content.push(h2("1.3. Escopo"));
content.push(p("Está dentro do escopo: módulos web responsivos para administradores, auditores e financeiro; geração automática de documentos; envio de notificações por e-mail; armazenamento seguro de evidências e certificados; integração SSO."));
content.push(p("Está fora do escopo desta versão inicial: portal externo do cliente (sugerido como evolução), aplicativo móvel nativo, integração com ERP financeiro, faturamento automatizado contra o cliente."));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("2. Perfis e Consoles do Sistema"));
content.push(h2("2.1. Separação de Consoles"));
content.push(p("O sistema oferece duas experiências de uso distintas, segregadas por perfil:"));
content.push(bullet([new TextRun({ text: "Console Administrativa (back office Dédalo): ", bold: true }), new TextRun("usada pelo time interno para configurar e operar o sistema. Concentra todos os cadastros (auditores, clientes, normas, controles, processos), a alocação de auditorias, a aprovação de relatórios, a aprovação de pagamentos e a configuração geral.")]));
content.push(bullet([new TextRun({ text: "Console do Auditor (operação em campo): ", bold: true }), new TextRun("interface enxuta, focada exclusivamente em executar as auditorias alocadas. O auditor não cria normas, processos, clientes ou outros dados-mestre — apenas consome o que foi previamente cadastrado pela Dédalo. Ele pode: visualizar suas auditorias, fazer upload do plano, executar o checklist filtrando por processo, gerar o relatório, e solicitar pagamento via NF.")]));
content.push(p("A separação é tanto visual (telas e menus diferentes) quanto técnica (Row Level Security no banco e middleware de autorização)."));

content.push(h2("2.2. Perfis"));
content.push(tableFromRows(
  ["Perfil", "Console", "Responsabilidades", "Principais Permissões"],
  [
    ["Administrador", "Administrativa", "Gestão geral do sistema, cadastros, alocações, aprovação de relatórios.", "Acesso total a todos os módulos e dados."],
    ["Auditor", "Auditor", "Executar auditorias alocadas, subir plano, executar checklist, solicitar pagamento.", "Vê apenas auditorias alocadas a si. NÃO cria normas, processos, clientes nem auditores. Edita apenas a execução, plano e NF próprios."],
    ["Financeiro", "Administrativa (recorte)", "Receber e processar solicitações de pagamento.", "Acesso somente ao módulo de pagamentos; recebe notificações."],
    ["(Futuro) Cliente", "Portal externo", "Visualizar próprias auditorias e relatórios.", "Acesso somente leitura ao próprio espaço."],
  ],
  [1700, 1700, 3000, 2960]
));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("3. Módulos Funcionais"));

content.push(h2("3.1. Autenticação e Controle de Acesso"));
content.push(bullet("Login exclusivo via SSO Google Workspace e Microsoft Entra ID (Azure AD). Não haverá login com senha local."));
content.push(bullet("Provisionamento de usuário: criação manual pelo administrador, com vinculação do e-mail corporativo ao perfil (Administrador, Auditor ou Financeiro)."));
content.push(bullet("Sessão com expiração configurável (default: 8 horas). Logout único (SLO) quando suportado."));
content.push(bullet("Trilha de auditoria de acessos: data, hora, IP, navegador, ação realizada."));
content.push(bullet("Bloqueio automático de usuários desligados via desativação manual ou via política do provedor SSO."));

content.push(h2("3.2. Cadastro de Auditores"));
content.push(p("Repositório completo das credenciais e disponibilidade dos auditores da Dédalo."));
content.push(h3("Campos obrigatórios"));
content.push(bullet("Nome completo, CPF, data de nascimento."));
content.push(bullet("Dados de contato: e-mail corporativo (chave SSO), telefone, endereço."));
content.push(bullet("Dados bancários e Razão Social / CNPJ (se PJ) para pagamento."));
content.push(bullet("Normas atendidas (múltipla seleção): ISO 9001, ISO 27001, ISO 14001, ISO 45001, ISO 37001, ISO 22301, ISO 13485 e personalizáveis."));
content.push(bullet("Anexos: diplomas, certificados (CQI/IRCA, Exemplar Global), comprovantes de treinamento. Cada anexo possui tipo, emissão, validade e arquivo (PDF/imagem)."));
content.push(bullet("Disponibilidade semanal (dias e horários típicos)."));
content.push(bullet("Tarifa-base por hora ou por dia (opcional)."));
content.push(h3("Regras"));
content.push(bullet("Alerta 60 dias antes do vencimento de qualquer certificado/credencial."));
content.push(bullet("Warning na alocação de auditorias para auditores com certificado vencido na norma."));
content.push(bullet("Histórico completo de auditorias realizadas, com métricas (no prazo, atrasos, satisfação do cliente)."));

content.push(h2("3.3. Cadastro de Normas, Controles e Processos"));
content.push(p("Esta é a biblioteca de referência que alimenta todas as auditorias. É de uso exclusivo da console administrativa — auditores apenas consomem o conteúdo cadastrado, sem permissão de criar ou editar."));

content.push(h3("3.3.1. Normas / Frameworks"));
content.push(p("Cada norma representa um framework auditável (ISO 9001, ISO 27001, LGPD, SOC 2, Sarbanes-Oxley, frameworks internos do cliente, etc.)."));
content.push(bullet("Código (ex.: ISO 9001:2015), nome, versão, descrição."));
content.push(bullet("Família / categoria (Qualidade, Segurança, Meio Ambiente, Saúde, etc.)."));
content.push(bullet("Status (Ativa, Em Revisão, Descontinuada)."));

content.push(h3("3.3.2. Controles / Requisitos"));
content.push(p("Cada norma é composta por uma hierarquia de controles (ou requisitos, ou cláusulas — o termo é configurável conforme a norma)."));
content.push(bullet("Código (ex.: 7.1.5.2)."));
content.push(bullet("Título e descrição completa."));
content.push(bullet("Hierarquia (controle-pai, subitens)."));
content.push(bullet("Ordem de apresentação dentro da norma."));
content.push(bullet("Processos associados (uma ou mais relações com a entidade Processo). Esse vínculo é o que permite o auditor filtrar a execução por processo."));

content.push(h3("3.3.3. Processos"));
content.push(p("Cadastro mestre de processos auditáveis da Dédalo, reutilizáveis em diversas normas e auditorias. Exemplos típicos: \"Gestão de Recursos Humanos\", \"Desenvolvimento de Software\", \"Compras\", \"Vendas\", \"Atendimento ao Cliente\", \"Gestão de Mudanças\", \"Backup e Recuperação\", \"Controles de Acesso\"."));
content.push(bullet("Código curto (ex.: RH, DEV, COM)."));
content.push(bullet("Nome do processo."));
content.push(bullet("Descrição."));
content.push(bullet("Categoria (Operacional, Suporte, Gestão)."));
content.push(bullet("Status (Ativo, Inativo)."));
content.push(bullet("Lista (somente leitura) dos controles que referenciam este processo, com filtro por norma."));

content.push(h3("3.3.4. Regras"));
content.push(bullet("Apenas perfis com permissão administrativa criam, editam ou removem normas, controles e processos."));
content.push(bullet("Auditores têm acesso somente leitura a estes dados, restrito ao contexto das auditorias alocadas."));
content.push(bullet("Não é permitido excluir uma norma, controle ou processo já utilizado em auditorias existentes — apenas inativar."));
content.push(bullet("Alteração no texto de um controle não afeta auditorias já em execução (snapshot do conteúdo no momento da alocação)."));

content.push(h2("3.4. Cadastro de Clientes"));
content.push(h3("Campos obrigatórios"));
content.push(bullet("Razão social, nome fantasia, CNPJ."));
content.push(bullet("Endereço completo e contatos (principal, técnico, financeiro)."));
content.push(bullet("Setor de atuação, porte e número de colaboradores (impacta dimensionamento da auditoria)."));
content.push(bullet("Normas contratadas (múltipla seleção)."));
content.push(bullet("Periodicidade por norma: anual, semestral, trimestral, customizada."));
content.push(bullet("Data de início do contrato, data de vencimento, valor contratado."));
content.push(bullet("Anexos contratuais: contrato assinado, escopo de certificação, organograma."));
content.push(h3("Regras"));
content.push(bullet("Cronograma anual de auditorias gerado automaticamente com base na periodicidade contratada."));
content.push(bullet("Alerta 90 dias antes do vencimento do contrato (renovação)."));
content.push(bullet("Bloqueio de exclusão de cliente com auditorias em aberto (somente arquivamento)."));

content.push(h2("3.5. Alocação de Auditorias"));
content.push(p("Administrador cria a auditoria, vincula ao cliente, define norma, datas, escopo, processos a serem auditados e atribui o auditor responsável."));
content.push(h3("Campos da auditoria"));
content.push(bullet("Cliente (vinculado)."));
content.push(bullet("Norma a auditar (filtra auditores qualificados)."));
content.push(bullet("Processos a auditar (subconjunto dos processos vinculados aos controles da norma): o auditor verá no checklist apenas os controles ligados a esses processos. Se nenhum processo for selecionado, todos os controles da norma são incluídos."));
content.push(bullet("Tipo: Inicial, Manutenção, Recertificação, Acompanhamento de plano de ação."));
content.push(bullet("Data planejada de execução (início e fim)."));
content.push(bullet("Escopo / unidades a auditar."));
content.push(bullet("Auditor líder + auditores de apoio (opcional)."));
content.push(bullet("Status: Planejada, Plano Pendente, Em Execução, Pendente Relatório, Concluída, Cancelada."));
content.push(h3("Regras de imparcialidade (ISO 19011 §5.2)"));
content.push(bullet("Warning ao alocar o mesmo auditor no mesmo cliente por mais de 3 ciclos consecutivos."));
content.push(bullet("Registro do motivo quando regra for sobrescrita pelo administrador."));

content.push(h2("3.6. Execução da Auditoria (Console do Auditor)"));
content.push(p("Auditor realiza a auditoria diretamente no sistema, dispensando relatório externo. A execução acontece dentro da Console do Auditor, que mostra apenas as auditorias alocadas ao usuário logado."));
content.push(h3("Etapas"));
content.push(numItem("Upload do Plano de Auditoria (PDF/DOCX). Notifica administradores."));
content.push(numItem([new TextRun({ text: "Execução do Checklist com filtro por processo. ", bold: true }), new TextRun("O sistema carrega os controles da norma e exibe um filtro lateral por processo (ex.: \"Gestão de RH\", \"Desenvolvimento de Software\"). O auditor seleciona o processo que está auditando no momento e o checklist passa a mostrar apenas os controles relacionados, em sequência. Para cada item, o auditor preenche evidência (texto), classificação (Conforme / NC Maior / NC Menor / Observação / Oportunidade de Melhoria), anexos e recomendação.")]));
content.push(numItem("Fechamento - ao concluir todos os processos selecionados, o sistema gera o Relatório em DOCX e PDF."));
content.push(numItem("Validação - administrador revisa e aprova antes do envio ao cliente."));
content.push(numItem("Envio ao Cliente - por e-mail com link seguro ou anexo."));
content.push(h3("Restrições da Console do Auditor"));
content.push(bullet("Acesso somente leitura ao catálogo de normas, controles e processos."));
content.push(bullet("Não pode cadastrar clientes, auditores, normas, processos ou se auto-alocar em auditorias."));
content.push(bullet("Vê somente notificações pertinentes às suas auditorias."));
content.push(bullet("Pode emitir solicitação de pagamento (NF) apenas para auditorias que liderou e cujo relatório foi aprovado."));
content.push(h3("Templates de norma pré-carregados (proposta)"));
content.push(tableFromRows(
  ["Norma", "Família", "Controles/Requisitos"],
  [
    ["ISO 9001:2015", "Qualidade", "10 cláusulas (4 a 10) + subitens"],
    ["ISO 27001:2022", "Segurança da Informação", "93 controles do Anexo A"],
    ["ISO 14001:2015", "Meio Ambiente", "10 cláusulas + subitens"],
    ["ISO 45001:2018", "SST", "10 cláusulas + subitens"],
    ["ISO 37001:2016", "Antissuborno", "10 cláusulas + subitens"],
  ],
  [2400, 2800, 4160]
));

content.push(h2("3.7. Geração de Relatório"));
content.push(bullet("Gerado automaticamente a partir do checklist preenchido."));
content.push(bullet("Templates configuráveis em Word com placeholders (logo Dédalo, dados do cliente, sumário executivo, conformidades, não-conformidades, plano de ação proposto)."));
content.push(bullet("Exportação simultânea em DOCX (editável) e PDF (final)."));
content.push(bullet("Versionamento: cada nova geração cria nova versão e preserva o histórico."));
content.push(bullet("Assinatura digital opcional via ICP-Brasil ou e-signature integrada."));

content.push(h2("3.8. Notificações"));
content.push(p("Matriz de notificações por e-mail (e opcionalmente Microsoft Teams / Slack):"));
content.push(tableFromRows(
  ["Evento", "Destinatário", "Quando"],
  [
    ["Alocação em auditoria", "Auditor", "Imediato"],
    ["Lembrete plano de auditoria", "Auditor", "30 dias antes"],
    ["Lembrete auditoria próxima", "Auditor", "15 dias e 3 dias antes"],
    ["Plano enviado", "Administrador", "Imediato após upload"],
    ["Auditoria concluída", "Administrador", "Imediato"],
    ["Relatório pendente", "Auditor + Admin", "5, 10 e 14 dias após fim"],
    ["Relatório atrasado", "Admin", "Diariamente após 15 dias"],
    ["Solicitação de pagamento", "Financeiro", "Imediato após NF + valor"],
    ["Certificado a vencer", "Auditor + Admin", "60, 30 e 7 dias antes"],
    ["Renovação contratual", "Admin", "90 dias antes do fim do contrato"],
  ],
  [3500, 2700, 3160]
));

content.push(h2("3.9. Solicitação de Pagamento"));
content.push(bullet("Disponível para o auditor apenas após plano + relatório aprovados."));
content.push(bullet("Auditor anexa NF (PDF), preenche valor, descrição e dados bancários (auto-preenchidos)."));
content.push(bullet("Sistema gera ID de pagamento e envia e-mail ao Financeiro."));
content.push(bullet("Financeiro atualiza status: Recebida, Em Processamento, Paga, Rejeitada (com motivo)."));
content.push(bullet("Auditor é notificado a cada mudança de status."));

content.push(h2("3.10. Dashboard Gerencial"));
content.push(bullet("KPIs do mês: auditorias planejadas, em execução, concluídas, atrasadas."));
content.push(bullet("Ocupação por auditor (% de utilização)."));
content.push(bullet("Auditorias por norma e por cliente."));
content.push(bullet("Pagamentos em aberto x pagos."));
content.push(bullet("Certificados de auditores próximos do vencimento."));
content.push(bullet("Renovação de contratos clientes."));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("4. Modelo de Dados (Entidades Principais)"));
content.push(tableFromRows(
  ["Entidade", "Campos-chave"],
  [
    ["User", "id, email, sso_provider, sso_subject, role, status, created_at"],
    ["Auditor", "user_id, nome, cpf, cnpj, telefone, endereço, tarifa, normas[], disponibilidade"],
    ["AuditorCertificate", "id, auditor_id, tipo, emissor, emissão, validade, arquivo_url"],
    ["Client", "id, razao_social, cnpj, contatos, normas_contratadas[], periodicidade, contrato_inicio, contrato_fim, valor"],
    ["ClientAttachment", "id, client_id, tipo, arquivo_url"],
    ["Audit", "id, client_id, norma_id, tipo, escopo, data_inicio, data_fim, status, lider_id, apoio_ids[]"],
    ["AuditPlan", "id, audit_id, arquivo_url, uploaded_at"],
    ["AuditChecklistItem", "id, audit_id, controle_id, evidencia, classificacao, recomendacao"],
    ["AuditAttachment", "id, audit_id, checklist_item_id, arquivo_url"],
    ["AuditReport", "id, audit_id, versao, docx_url, pdf_url, gerado_em, aprovado_por, aprovado_em"],
    ["Norma", "id, codigo (ISO 9001:2015), nome, versao, familia, status"],
    ["NormaControle", "id, norma_id, codigo, titulo, descricao, parent_id (hierarquia), ordem"],
    ["Processo", "id, codigo, nome, descricao, categoria, status"],
    ["ControleProcesso", "controle_id, processo_id (relação N:N entre NormaControle e Processo)"],
    ["AuditProcesso", "audit_id, processo_id (processos selecionados para esta auditoria)"],
    ["PaymentRequest", "id, audit_id, auditor_id, valor, nf_url, status, criada_em, paga_em"],
    ["Notification", "id, user_id, evento, payload, lida, enviada_em"],
    ["AuditLog", "id, user_id, entidade, entidade_id, acao, payload, ip, user_agent, criado_em"],
  ],
  [2800, 6560]
));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("5. Regras de Negócio (RN)"));
content.push(tableFromRows(["ID", "Regra"], [
  ["RN-01", "Auditor só visualiza/edita auditorias em que está alocado como líder ou apoio (enforced via RLS no banco)."],
  ["RN-02", "Administrador acessa todas as auditorias, cadastros e relatórios via Console Administrativa."],
  ["RN-03", "Auditor NÃO tem permissão de criar, editar ou excluir normas, controles, processos, clientes ou outros auditores. Acesso é somente leitura ao catálogo."],
  ["RN-04", "Solicitação de pagamento exige plano + relatório aprovados."],
  ["RN-05", "Bloqueio de alocação se o auditor não possui certificado vigente para a norma (sobrescritível com justificativa)."],
  ["RN-06", "Warning de alocação do mesmo auditor no mesmo cliente por mais de 3 ciclos consecutivos (ISO 19011 §5.2)."],
  ["RN-07", "Cliente não pode ser excluído enquanto tiver auditorias em status diferente de Concluída ou Cancelada."],
  ["RN-08", "Auditor tem 15 dias corridos após o fim da auditoria para concluir o relatório. Após, status muda para Atrasado e admin é notificado diariamente."],
  ["RN-09", "Todo download de relatório ou anexo é registrado no AuditLog."],
  ["RN-10", "Cronograma anual do cliente é gerado automaticamente, mas auditorias só são criadas após confirmação do admin."],
  ["RN-11", "Valor da solicitação de pagamento não pode ser editado após status Em Processamento."],
  ["RN-12", "Norma, controle ou processo já utilizado em auditorias existentes não pode ser excluído, apenas inativado."],
  ["RN-13", "Alteração no texto de um controle não afeta auditorias já em execução (snapshot no momento da alocação)."],
  ["RN-14", "O checklist de uma auditoria mostra apenas os controles cujos processos estão na seleção da auditoria. Se nenhum processo for selecionado, mostra todos os controles da norma."],
], [1200, 8160]));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("6. Fluxos Principais"));
content.push(h2("6.0. Fluxo de Configuração Inicial (Console Administrativa)"));
content.push(numItem("Admin cadastra os Processos auditáveis da Dédalo (RH, Desenvolvimento, Compras, etc.)."));
content.push(numItem("Admin cadastra as Normas e seus Controles (manual ou importando templates pré-carregados)."));
content.push(numItem("Para cada Controle, admin associa um ou mais Processos."));
content.push(numItem("Admin cadastra Auditores (com normas que atendem e certificados) e Clientes (com normas contratadas)."));
content.push(numItem("Sistema fica pronto para a operação recorrente."));

content.push(h2("6.1. Fluxo Padrão de Auditoria"));
content.push(numItem("Administrador cadastra cliente e contrato."));
content.push(numItem("Sistema sugere cronograma anual."));
content.push(numItem("Administrador confirma e cria auditoria específica."));
content.push(numItem("Administrador aloca auditor, define norma e seleciona os processos a serem auditados (ex.: somente \"Gestão de RH\" e \"Desenvolvimento\") → auditor recebe e-mail."));
content.push(numItem("30 dias antes: auditor recebe lembrete e faz upload do plano."));
content.push(numItem("Administrador é notificado e revisa o plano."));
content.push(numItem("Na data planejada: auditor entra na Console do Auditor, abre a auditoria, filtra por processo e preenche o checklist no sistema."));
content.push(numItem("Auditor clica em \"Concluir Auditoria\" → sistema gera Relatório DOCX + PDF."));
content.push(numItem("Administrador revisa, aprova e o relatório é enviado ao cliente."));
content.push(numItem("Auditor anexa NF e solicita pagamento → financeiro recebe e processa."));
content.push(h2("6.2. Fluxo de Exceção - Atraso de Relatório"));
content.push(numItem("Auditor concluiu execução, mas não fechou o relatório."));
content.push(numItem("5, 10 e 14 dias após o fim: lembretes ao auditor."));
content.push(numItem("Após 15 dias: status Atrasado, administrador recebe notificação diária."));
content.push(numItem("Administrador pode escalar ou reatribuir."));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("7. Requisitos Não Funcionais"));
content.push(tableFromRows(["Categoria", "Requisito"], [
  ["Segurança", "SSO Google + Microsoft; TLS 1.2+; criptografia em repouso AES-256; MFA herdado do provedor SSO."],
  ["LGPD", "Política de retenção, consentimento, direito de acesso/exclusão, registro das operações."],
  ["Disponibilidade", "99,5% mensal. Backup diário + retenção 30 dias."],
  ["Performance", "Resposta < 2s em 95% das operações; geração de relatório DOCX/PDF < 30s."],
  ["Escalabilidade", "Suportar 50 auditores ativos, 200 clientes, 1.000 auditorias/ano inicialmente."],
  ["Acessibilidade", "WCAG 2.1 nível AA nas telas principais."],
  ["Responsivo", "Desktop e tablet. Mobile como leitura/consulta."],
  ["Idioma", "Português (BR). Arquitetura preparada para EN/ES."],
  ["Auditoria do sistema", "Trilha completa de acessos e alterações preservada por 5 anos."],
], [2400, 6960]));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("8. Melhorias Sugeridas (Roadmap)"));
content.push(tableFromRows(["Prioridade", "Funcionalidade", "Benefício"], [
  ["Alta", "Templates de norma pré-carregados", "Acelera adoção; padroniza checklist."],
  ["Alta", "Classificação ISO 19011 de não-conformidades", "Aderência normativa."],
  ["Alta", "Banco de evidências por item", "Garante rastreabilidade."],
  ["Alta", "Regra de imparcialidade automática", "Conformidade ISO 19011 §5.2."],
  ["Média", "Plano de ação e follow-up", "Fecha o ciclo PDCA."],
  ["Média", "Portal do cliente (somente leitura)", "Diferencial competitivo."],
  ["Média", "Dashboard gerencial com KPIs", "Visibilidade para diretoria."],
  ["Média", "Assinatura digital", "Validade jurídica."],
  ["Média", "Pesquisa de satisfação automática", "Mede NPS pós-auditoria."],
  ["Baixa", "Aplicativo mobile nativo", "Conforto para auditor em campo."],
  ["Baixa", "Integração com ERP financeiro", "Automação contábil."],
  ["Baixa", "IA para sugerir constatações", "Acelera a escrita do auditor."],
], [1400, 3200, 4760]));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("9. Critérios de Aceite do MVP"));
content.push(bullet("Login SSO Google e Microsoft funcional para os três perfis, com redirecionamento para a console correta (Admin ou Auditor)."));
content.push(bullet("Console Administrativa com CRUD completo de Auditor, Cliente, Norma, Controle, Processo e Auditoria."));
content.push(bullet("Console do Auditor restrita: vê somente suas auditorias e o catálogo (somente leitura)."));
content.push(bullet("Vínculo Controle ↔ Processo (N:N) configurável na console administrativa."));
content.push(bullet("Alocação de auditor a auditoria com seleção de processos e envio de e-mail."));
content.push(bullet("Upload de plano e checklist com filtro por processo, em pelo menos uma norma (ISO 9001 ou 27001)."));
content.push(bullet("Geração de relatório em DOCX e PDF a partir do checklist."));
content.push(bullet("Fluxo de solicitação de pagamento com envio ao financeiro."));
content.push(bullet("Notificações automáticas conforme matriz da seção 3.8."));
content.push(bullet("Trilha de auditoria de acessos e mutações."));
content.push(new Paragraph({ children: [new PageBreak()] }));

content.push(h1("10. Próximos Passos"));
content.push(numItem("Aprovar este documento de requisitos."));
content.push(numItem("Revisar o protótipo navegável em HTML."));
content.push(numItem("Validar a arquitetura técnica e a stack."));
content.push(numItem("Definir cronograma por sprints (sugestão: 4 sprints quinzenais para o MVP)."));
content.push(numItem("Iniciar desenvolvimento usando Claude Code com o CLAUDE.md provisionado."));

const doc = new Document({
  creator: "Dédalo",
  title: "Sistema de Gestão de Auditorias - Documento de Requisitos",
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
    properties: {
      page: { size: { width: 11906, height: 16838 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Dédalo • Sistema de Gestão de Auditorias", color: "888888", size: 18 })],
      })] }),
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
        children: [
          new TextRun({ text: "Documento de Requisitos v1.0", color: "888888", size: 18 }),
          new TextRun({ text: "\tPágina ", color: "888888", size: 18 }),
          new TextRun({ children: [PageNumber.CURRENT], color: "888888", size: 18 }),
        ],
      })] }),
    },
    children: content,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/sessions/tender-nice-brown/mnt/Sistema de auditoria/dedalo/dedalo_requisitos.docx", buf);
  console.log("OK");
});
