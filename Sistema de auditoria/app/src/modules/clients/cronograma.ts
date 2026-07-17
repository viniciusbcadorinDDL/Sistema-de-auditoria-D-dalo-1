import type { Periodicidade } from "./schema";

export function intervaloMeses(
  periodicidade: Periodicidade,
  customMeses?: number | null,
): number {
  switch (periodicidade) {
    case "ANUAL":
      return 12;
    case "SEMESTRAL":
      return 6;
    case "TRIMESTRAL":
      return 3;
    case "CUSTOM":
      return customMeses && customMeses > 0 ? customMeses : 12;
  }
}

/**
 * Gera as datas previstas de auditoria dentro da vigência do contrato,
 * a partir do início, somando o intervalo. A primeira ocorrência é
 * agendada um intervalo após o início do contrato.
 */
export function computeCronograma(
  contractStart: Date,
  contractEnd: Date,
  meses: number,
): Date[] {
  const datas: Date[] = [];
  if (meses <= 0) return datas;
  const cursor = new Date(contractStart);
  cursor.setMonth(cursor.getMonth() + meses);
  let guard = 0;
  while (cursor <= contractEnd && guard < 240) {
    datas.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + meses);
    guard++;
  }
  return datas;
}
