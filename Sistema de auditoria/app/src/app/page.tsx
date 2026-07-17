import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          Sistema interno
        </span>
        <h1 className="text-4xl font-bold tracking-tight">Dédalo</h1>
        <p className="max-w-md text-balance text-muted-foreground">
          Plataforma de gestão do ciclo completo de auditorias: cadastros,
          alocação, execução, relatórios e faturamento.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Entrar
      </Link>
    </main>
  );
}
