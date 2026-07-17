import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Mocks das dependências (banco, autorização, auditoria, cache) ---
vi.mock("@/lib/db", () => ({
  db: {
    processo: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: { create: vi.fn() },
  },
}));

vi.mock("@/lib/rbac", () => ({
  requireAdmin: vi.fn(async () => ({ id: "admin-1", role: "ADMIN" })),
  ForbiddenError: class ForbiddenError extends Error {},
}));

vi.mock("@/lib/audit-log", () => ({ logAction: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { db } from "@/lib/db";
import { logAction } from "@/lib/audit-log";
import {
  createProcesso,
  deleteProcesso,
  updateProcesso,
} from "./actions";

const mockDb = db as unknown as {
  processo: {
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createProcesso", () => {
  it("rejeita entrada inválida com fieldErrors", async () => {
    const res = await createProcesso({ codigo: "", nome: "", categoria: "X" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.fieldErrors?.codigo).toBeTruthy();
      expect(res.fieldErrors?.nome).toBeTruthy();
      expect(res.fieldErrors?.categoria).toBeTruthy();
    }
    expect(mockDb.processo.create).not.toHaveBeenCalled();
  });

  it("rejeita código duplicado", async () => {
    mockDb.processo.findUnique.mockResolvedValue({ id: "x", codigo: "RH" });
    const res = await createProcesso({
      codigo: "rh",
      nome: "Recursos Humanos",
      categoria: "SUPORTE",
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors?.codigo).toBe("Código já existe");
    expect(mockDb.processo.create).not.toHaveBeenCalled();
  });

  it("cria, normaliza o código em maiúsculas e registra AuditLog", async () => {
    mockDb.processo.findUnique.mockResolvedValue(null);
    mockDb.processo.create.mockResolvedValue({
      id: "novo",
      codigo: "RH",
      nome: "Recursos Humanos",
    });

    const res = await createProcesso({
      codigo: "rh",
      nome: "Recursos Humanos",
      categoria: "SUPORTE",
    });

    expect(res.ok).toBe(true);
    expect(mockDb.processo.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ codigo: "RH", categoria: "SUPORTE" }),
    });
    expect(logAction).toHaveBeenCalledWith(
      expect.objectContaining({ acao: "CREATE", entidade: "Processo" }),
    );
  });
});

describe("updateProcesso", () => {
  it("rejeita se o código colidir com outro processo", async () => {
    mockDb.processo.findFirst.mockResolvedValue({ id: "outro" });
    const res = await updateProcesso("id-1", {
      codigo: "RH",
      nome: "RH",
      categoria: "SUPORTE",
    });
    expect(res.ok).toBe(false);
    expect(mockDb.processo.update).not.toHaveBeenCalled();
  });
});

describe("deleteProcesso", () => {
  it("recusa exclusão quando há controles vinculados", async () => {
    mockDb.processo.findUnique.mockResolvedValue({
      id: "id-1",
      codigo: "RH",
      _count: { controles: 5, audits: 0 },
    });
    const res = await deleteProcesso("id-1");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/Inative/i);
    expect(mockDb.processo.delete).not.toHaveBeenCalled();
  });

  it("exclui quando não há vínculos", async () => {
    mockDb.processo.findUnique.mockResolvedValue({
      id: "id-1",
      codigo: "RH",
      _count: { controles: 0, audits: 0 },
    });
    const res = await deleteProcesso("id-1");
    expect(res.ok).toBe(true);
    expect(mockDb.processo.delete).toHaveBeenCalledWith({
      where: { id: "id-1" },
    });
  });
});
