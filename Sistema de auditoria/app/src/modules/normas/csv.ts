export type ControleCsvRow = {
  codigo: string;
  titulo: string;
  descricao: string;
  parentCodigo: string | null;
  processosCodigos: string[];
};

/** Divide uma linha de CSV respeitando aspas duplas e "" como escape. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/**
 * Faz o parse do CSV de controles.
 * Colunas: codigo, titulo, descricao, parent_codigo, processos_codigos
 * (processos separados por ponto-e-vírgula). A primeira linha pode ser
 * um cabeçalho (detectado quando a 1ª célula é "codigo").
 */
export function parseControlesCsv(text: string): ControleCsvRow[] {
  const linhas = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (linhas.length === 0) return [];

  const primeira = splitCsvLine(linhas[0]!);
  const temCabecalho = primeira[0]?.toLowerCase() === "codigo";
  const dados = temCabecalho ? linhas.slice(1) : linhas;

  const rows: ControleCsvRow[] = [];
  for (const linha of dados) {
    const cols = splitCsvLine(linha);
    const codigo = cols[0] ?? "";
    const titulo = cols[1] ?? "";
    if (!codigo || !titulo) continue; // ignora linhas sem código/título
    rows.push({
      codigo,
      titulo,
      descricao: cols[2] ?? "",
      parentCodigo: cols[3] ? cols[3] : null,
      processosCodigos: (cols[4] ?? "")
        .split(";")
        .map((c) => c.trim())
        .filter((c) => c.length > 0),
    });
  }
  return rows;
}
