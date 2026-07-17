import { notFound } from "next/navigation";
import { getClient } from "@/modules/clients/queries";
import { listNormas } from "@/modules/normas/queries";
import { computeCronograma, intervaloMeses } from "@/modules/clients/cronograma";
import type { Periodicidade } from "@/modules/clients/schema";
import {
  ClientDetailClient,
  type ClienteDisplay,
} from "./client-detail-client";

export const dynamic = "force-dynamic";

type Contato = { nome?: string; cargo?: string; email?: string; telefone?: string };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, normas] = await Promise.all([getClient(id), listNormas()]);
  if (!client) notFound();

  const arr = Array.isArray(client.contacts)
    ? (client.contacts as Contato[])
    : [];
  const c0 = arr[0] ?? {};

  const cliente: ClienteDisplay = {
    id: client.id,
    razaoSocial: client.razaoSocial,
    nomeFantasia: client.nomeFantasia,
    cnpj: client.cnpj,
    setor: client.setor,
    porte: client.porte,
    numColaboradores: client.numColaboradores,
    contractStart: client.contractStart.toISOString().slice(0, 10),
    contractEnd: client.contractEnd.toISOString().slice(0, 10),
    contractValue: client.contractValue ? client.contractValue.toString() : null,
    contato: {
      nome: c0.nome ?? "",
      cargo: c0.cargo ?? "",
      email: c0.email ?? "",
      telefone: c0.telefone ?? "",
    },
    normas: client.normas.map((cn) => ({
      normaId: cn.normaId,
      periodicidade: cn.periodicidade,
      customMeses: cn.customMeses,
    })),
    archived: client.archived,
    setorLabel: client.setor ?? "—",
    porteLabel: client.porte ?? "—",
    numColaboradoresLabel: client.numColaboradores?.toString() ?? "—",
    contractValueLabel: client.contractValue
      ? `R$ ${Number(client.contractValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
      : "—",
  };

  const cronograma = client.normas.map((cn) => ({
    normaCodigo: cn.norma.codigo,
    datas: computeCronograma(
      client.contractStart,
      client.contractEnd,
      intervaloMeses(cn.periodicidade as Periodicidade, cn.customMeses),
    ).map((d) => d.toISOString()),
  }));

  return (
    <ClientDetailClient
      cliente={cliente}
      normas={normas.map((n) => ({ id: n.id, codigo: n.codigo }))}
      audits={client.audits.map((a) => ({
        id: a.id,
        numero: a.numero,
        normaCodigo: a.norma.codigo,
        dataInicio: a.dataInicio.toISOString(),
        status: a.status,
      }))}
      cronograma={cronograma}
    />
  );
}
