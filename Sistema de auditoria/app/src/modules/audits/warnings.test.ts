import { describe, expect, it } from "vitest";
import { evaluateWarnings } from "./warnings";

const base = {
  leaderId: "u1",
  leaderName: "Ana",
  normaCodigo: "ISO 9001:2015",
  dataInicio: new Date("2026-06-01"),
};

describe("evaluateWarnings", () => {
  it("avisa quando não há certificado", () => {
    const w = evaluateWarnings({ ...base, certExpiresAt: null, ultimosLideresIds: [] });
    expect(w.map((x) => x.code)).toContain("CERT_VENCIDO");
  });

  it("avisa quando o certificado venceu antes do início", () => {
    const w = evaluateWarnings({
      ...base,
      certExpiresAt: new Date("2026-01-01"),
      ultimosLideresIds: [],
    });
    expect(w.map((x) => x.code)).toContain("CERT_VENCIDO");
  });

  it("não avisa com certificado válido", () => {
    const w = evaluateWarnings({
      ...base,
      certExpiresAt: new Date("2027-01-01"),
      ultimosLideresIds: [],
    });
    expect(w.map((x) => x.code)).not.toContain("CERT_VENCIDO");
  });

  it("avisa imparcialidade no 3º ciclo consecutivo", () => {
    const w = evaluateWarnings({
      ...base,
      certExpiresAt: new Date("2027-01-01"),
      ultimosLideresIds: ["u1", "u1"],
    });
    expect(w.map((x) => x.code)).toContain("IMPARCIALIDADE");
  });

  it("não avisa imparcialidade se o líder anterior é outro", () => {
    const w = evaluateWarnings({
      ...base,
      certExpiresAt: new Date("2027-01-01"),
      ultimosLideresIds: ["u1", "u2"],
    });
    expect(w.map((x) => x.code)).not.toContain("IMPARCIALIDADE");
  });
});
