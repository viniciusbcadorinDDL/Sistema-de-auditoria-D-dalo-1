import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Storage de arquivos.
 *
 * DEV: grava no diretório local `uploads/` (ignorado pelo git) e serve
 * via a rota `/api/files/[...key]`. Em produção, troque por Supabase
 * Storage (ver .env.example). A interface (saveFile/readStoredFile)
 * deve permanecer estável.
 */
const ROOT = path.join(process.cwd(), "uploads");

function sanitizeName(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_").slice(-80);
}

export async function saveFile(
  folder: string,
  file: File,
): Promise<{ url: string; fileName: string }> {
  const buf = Buffer.from(await file.arrayBuffer());
  const key = `${folder}/${Date.now()}-${sanitizeName(file.name)}`;
  const dest = path.join(ROOT, key);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  return { url: `/api/files/${key}`, fileName: file.name };
}

/** Lê um arquivo armazenado pela chave relativa. Bloqueia path traversal. */
export async function readStoredFile(key: string): Promise<Buffer | null> {
  if (key.includes("..")) return null;
  const dest = path.join(ROOT, key);
  if (!dest.startsWith(ROOT) || !existsSync(dest)) return null;
  return readFile(dest);
}
