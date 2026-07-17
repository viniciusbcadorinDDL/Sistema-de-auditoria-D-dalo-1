import { describe, expect, it } from "vitest";
import { computeCronograma, intervaloMeses } from "./cronograma";

describe("intervaloMeses", () => {
  it("mapeia periodicidades", () => {
    expect(intervaloMeses("ANUAL")).toBe(12);
    expect(intervaloMeses("SEMESTRAL")).toBe(6);
    expect(intervaloMeses("TRIMESTRAL")).toBe(3);
    expect(intervaloMeses("CUSTOM", 4)).toBe(4);
    expect(intervaloMeses("CUSTOM", null)).toBe(12);
  });
});

describe("computeCronograma", () => {
  it("gera ocorrências anuais dentro da vigência", () => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2028, 0, 1);
    const datas = computeCronograma(start, end, 12);
    // 2027-01-01 e 2028-01-01
    expect(datas).toHaveLength(2);
    expect(datas[0]?.getFullYear()).toBe(2027);
    expect(datas[1]?.getFullYear()).toBe(2028);
  });

  it("gera ocorrências semestrais", () => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2027, 0, 1);
    const datas = computeCronograma(start, end, 6);
    expect(datas).toHaveLength(2); // jul/2026 e jan/2027
  });

  it("retorna vazio se o intervalo passa do fim", () => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 5, 1);
    expect(computeCronograma(start, end, 12)).toHaveLength(0);
  });
});
