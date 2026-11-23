"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  LayoutDashboard,
  Target,
  CalendarDays,
  Settings,
  HelpCircle,
  Plus,
  Minus,
  Sun,
  Moon,
  Laptop,
  LogOut,
  User,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface NavbarProps {
  onOpenNewTx: (type?: "in" | "out") => void;
}

export function Navbar({ onOpenNewTx }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Painel do Mês", href: "/dashboard", icon: LayoutDashboard },
    { label: "Metas & Reservas", href: "/metas", icon: Target },
    { label: "13 Meses", href: "/13-meses", icon: CalendarDays },
    { label: "Configurações", href: "/configuracoes", icon: Settings },
    { label: "Ajuda", href: "/ajuda", icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await logOut();
    router.replace("/login");
  };

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="fc-container" style={{ paddingTop: 10, paddingBottom: 10 }}>
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-sm"
                style={{ background: "var(--accent)" }}
              >
                FC
              </span>
              <span className="font-bold text-base sm:text-lg tracking-tight" style={{ color: "var(--text)" }}>
                FinControle
              </span>
            </Link>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-bold border hidden sm:inline-block"
              style={{
                background: "var(--subtle)",
                borderColor: "var(--border)",
                color: "var(--text-muted)",
              }}
            >
              v1.2
            </span>
          </div>

          {/* Abas de Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: active ? "var(--accent-bg)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-muted)",
                    border: active ? "1px solid var(--accent-border)" : "1px solid transparent",
                  }}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2">
            {/* Botão + Ganho (Verde Esmeralda) */}
            <button
              type="button"
              onClick={() => onOpenNewTx("in")}
              title="Adicionar Novo Ganho"
              className="fc-btn fc-btn-gain fc-btn-sm font-bold shadow-sm"
            >
              <TrendingUp size={14} />
              <span className="hidden sm:inline">+ Ganho</span>
              <span className="sm:hidden">+G</span>
            </button>

            {/* Botão + Gasto (Coral Carmim) */}
            <button
              type="button"
              onClick={() => onOpenNewTx("out")}
              title="Adicionar Novo Gasto"
              className="fc-btn fc-btn-expense fc-btn-sm font-bold shadow-sm"
            >
              <TrendingDown size={14} />
              <span className="hidden sm:inline">+ Gasto</span>
              <span className="sm:hidden">-G</span>
            </button>

            {/* Seletor de Tema Claro / Escuro / Auto */}
            <div
              className="hidden md:flex items-center p-0.5 rounded-full border text-xs ml-1"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <button
                type="button"
                onClick={() => setTheme("light")}
                title="Tema Claro"
                className="p-1.5 rounded-full transition-all"
                style={{
                  background: theme === "light" ? "var(--surface)" : "transparent",
                  color: theme === "light" ? "var(--text)" : "var(--text-muted)",
                  boxShadow: theme === "light" ? "var(--shadow-xs)" : "none",
                }}
              >
                <Sun size={13} />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                title="Tema Escuro"
                className="p-1.5 rounded-full transition-all"
                style={{
                  background: theme === "dark" ? "var(--surface)" : "transparent",
                  color: theme === "dark" ? "var(--text)" : "var(--text-muted)",
                  boxShadow: theme === "dark" ? "var(--shadow-xs)" : "none",
                }}
              >
                <Moon size={13} />
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                title="Tema Automático"
                className="p-1.5 rounded-full transition-all"
                style={{
                  background: theme === "system" ? "var(--surface)" : "transparent",
                  color: theme === "system" ? "var(--text)" : "var(--text-muted)",
                  boxShadow: theme === "system" ? "var(--shadow-xs)" : "none",
                }}
              >
                <Laptop size={13} />
              </button>
            </div>

            {/* Usuário e Logout */}
            <div className="flex items-center gap-1.5 pl-2 border-l" style={{ borderColor: "var(--border)" }}>
              <Link
                href="/configuracoes"
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors"
                style={{
                  background: "var(--subtle)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
                title={profile?.name || user?.email || "Meu Perfil"}
              >
                <User size={14} />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Sair da Conta"
                className="p-1.5 rounded-lg text-xs transition-colors hover:text-red-500"
                style={{ color: "var(--text-muted)" }}
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Botão Hambúrguer Mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 rounded-lg border text-xs"
              style={{
                background: "var(--subtle)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
              title="Abrir menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Menu Gaveta Mobile */}
        {mobileOpen && (
          <div
            className="lg:hidden pt-3 pb-2 mt-2 border-t flex flex-col gap-1"
            style={{ borderColor: "var(--border)" }}
          >
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: active ? "var(--accent-bg)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-muted)",
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="flex items-center justify-between pt-2 px-1 border-t" style={{ borderColor: "var(--border)" }}>
              <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Tema:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${theme === "light" ? "bg-white shadow text-black" : "text-gray-500"}`}
                >
                  Claro
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${theme === "dark" ? "bg-slate-700 shadow text-white" : "text-gray-500"}`}
                >
                  Escuro
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`px-2.5 py-1 rounded text-xs font-semibold ${theme === "system" ? "bg-blue-600 text-white" : "text-gray-500"}`}
                >
                  Auto
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
