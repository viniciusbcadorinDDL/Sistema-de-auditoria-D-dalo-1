import { notFound } from "next/navigation";
import { getNorma, listProcessosAtivos } from "@/modules/normas/queries";
import { NormaDetailClient } from "./norma-detail-client";

export const dynamic = "force-dynamic";

export default async function NormaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [norma, processos] = await Promise.all([
    getNorma(id),
    listProcessosAtivos(),
  ]);
  if (!norma) notFound();

  return (
    <NormaDetailClient
      norma={{
        id: norma.id,
        codigo: norma.codigo,
        nome: norma.nome,
        versao: norma.versao,
        familia: norma.familia,
        status: norma.status,
      }}
      controles={norma.controles.map((c) => ({
        id: c.id,
        codigo: c.codigo,
        titulo: c.titulo,
        descricao: c.descricao,
        parentId: c.parentId,
        ativo: c.ativo,
        ordem: c.ordem,
        processos: c.processos,
        _count: c._count,
      }))}
      processos={processos}
    />
  );
}
