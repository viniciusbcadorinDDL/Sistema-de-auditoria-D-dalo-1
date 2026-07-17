import { listClients } from "@/modules/clients/queries";
import { listNormas } from "@/modules/normas/queries";
import { ClientesClient, type ClientRow } from "./clientes-client";

export const dynamic = "force-dynamic";

type Contato = { nome?: string; cargo?: string; email?: string; telefone?: string };

function primeiroContato(contacts: unknown): {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
} {
  const arr = Array.isArray(contacts) ? (contacts as Contato[]) : [];
  const c = arr[0] ?? {};
  return {
    nome: c.nome ?? "",
    cargo: c.cargo ?? "",
    email: c.email ?? "",
    telefone: c.telefone ?? "",
  };
}

export default async function ClientesPage() {
  const [clientes, normas] = await Promise.all([listClients(), listNormas()]);

  const rows: ClientRow[] = clientes.map((c) => ({
    id: c.id,
    razaoSocial: c.razaoSocial,
    nomeFantasia: c.nomeFantasia,
    cnpj: c.cnpj,
    setor: c.setor,
    porte: c.porte,
    numColaboradores: c.numColaboradores,
    contractStart: c.contractStart.toISOString().slice(0, 10),
    contractEnd: c.contractEnd.toISOString().slice(0, 10),
    contractValue: c.contractValue ? c.contractValue.toString() : null,
    contato: primeiroContato(c.contacts),
    normas: c.normas.map((cn) => ({
      normaId: cn.normaId,
      periodicidade: cn.periodicidade,
      customMeses: cn.customMeses,
    })),
    archived: c.archived,
    auditsCount: c._count.audits,
    normaCodigos: c.normas.map((cn) => cn.norma.codigo),
  }));

  return (
    <ClientesClient
      clientes={rows}
      normas={normas.map((n) => ({ id: n.id, codigo: n.codigo }))}
    />
  );
}
