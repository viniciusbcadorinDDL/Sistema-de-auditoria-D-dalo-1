import { describe, expect, it } from "vitest";
import { formatCnpj, formatCpf, isValidCnpj, isValidCpf } from "./br-docs";

describe("isValidCpf", () => {
  it("aceita CPFs válidos (com e sem máscara)", () => {
    expect(isValidCpf("111.444.777-35")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
  });
  it("rejeita dígitos verificadores errados", () => {
    expect(isValidCpf("111.444.777-00")).toBe(false);
  });
  it("rejeita todos iguais e tamanho errado", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("123")).toBe(false);
  });
});

describe("isValidCnpj", () => {
  it("aceita CNPJ válido", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
  });
  it("rejeita inválido e todos iguais", () => {
    expect(isValidCnpj("11.222.333/0001-00")).toBe(false);
    expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
  });
});

describe("formatação", () => {
  it("formata CPF e CNPJ", () => {
    expect(formatCpf("11144477735")).toBe("111.444.777-35");
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });
});
