import { describe, expect, it } from "vitest";
import { parseControlesCsv } from "./csv";

describe("parseControlesCsv", () => {
  it("ignora cabeçalho e faz parse das colunas", () => {
    const csv = `codigo,titulo,descricao,parent_codigo,processos_codigos
8,Operação,Controles de operação,,QUA
8.4,Compras,Fornecedores externos,8,COM;TI`;
    const rows = parseControlesCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      codigo: "8",
      titulo: "Operação",
      parentCodigo: null,
      processosCodigos: ["QUA"],
    });
    expect(rows[1]).toMatchObject({
      codigo: "8.4",
      parentCodigo: "8",
      processosCodigos: ["COM", "TI"],
    });
  });

  it("respeita aspas com vírgulas internas", () => {
    const csv = `7.2,"Competência, formação e treinamento","Descrição, com vírgula",7,RH`;
    const rows = parseControlesCsv(csv);
    expect(rows[0]?.titulo).toBe("Competência, formação e treinamento");
    expect(rows[0]?.descricao).toBe("Descrição, com vírgula");
  });

  it("ignora linhas sem código ou título", () => {
    const csv = `8,Operação,,,
,SemCodigo,,,
9,,,,`;
    const rows = parseControlesCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.codigo).toBe("8");
  });
});
