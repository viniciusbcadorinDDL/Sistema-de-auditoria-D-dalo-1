"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  BookText,
  Workflow,
  ClipboardList,
  CalendarRange,
  Wallet,
  Bell,
  Settings,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: React.ElementType };
type Group = { section: string; items: Item[] };

const GROUPS: Group[] = [
  {
    section: "",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    section: "Cadastros (Gestão)",
    items: [
      { href: "/auditores", label: "Auditores", icon: Users },
      { href: "/clientes", label: "Clientes", icon: Building2 },
      { href: "/normas", label: "Normas & Controles", icon: BookText },
      { href: "/processos", label: "Processos", icon: Workflow },
    ],
  },
  {
    section: "Operação",
    items: [
      { href: "/auditorias", label: "Auditorias", icon: ClipboardList },
      { href: "/cronograma", label: "Cronograma", icon: CalendarRange },
    ],
  },
  {
    section: "Financeiro",
    items: [{ href: "/pagamentos", label: "Pagamentos", icon: Wallet }],
  },
  {
    section: "Sistema",
    items: [
      { href: "/notificacoes", label: "Notificações", icon: Bell },
      { href: "/trilha-auditoria", label: "Trilha de Auditoria", icon: ScrollText },
      { href: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export function AdminSidebar({
  userName,
  userRole,
}: {
  userName: string;
  userRole: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-60 flex-col bg-brand text-white">
      <div className="border-b border-white/10 px-6 pb-5 pt-6">
        <h1 className="text-xl font-bold tracking-widest">DÉDALO</h1>
        <span className="text-[11px] uppercase tracking-wide text-white/60">
          Gestão de Auditorias
        </span>
      </div>

      <div className="mx-6 my-3 rounded bg-brand-accent/15 px-2.5 py-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-brand-accent">
        Console Administrativa
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {GROUPS.map((group) => (
          <div key={group.section || "root"}>
            {group.section && (
              <div className="px-6 pb-2 pt-4 text-[11px] uppercase tracking-wider text-white/40">
                {group.section}
              </div>
            )}
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 border-l-[3px] border-transparent px-6 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/5 hover:text-white",
                    active &&
                      "border-brand-accent bg-white/10 font-medium text-white",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-4">
        <div className="text-[13px] font-semibold">{userName}</div>
        <div className="text-[11px] text-white/60">{userRole}</div>
      </div>
    </aside>
  );
}
