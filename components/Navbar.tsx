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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo e Versão */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 font-bold text-lg tracking-tight group"
              style={{ color: "var(--text)" }}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-sm tracking-tight transition-transform group-hover:scale-105"
                style={{ background: "var(--accent)", color: "#ffffff" }}
              >
                FC
              </span>
              <span className="font-extrabold text-base sm:text-lg">FinControle</span>
            </Link>
            <span
              className="text-[11px] px-2 py-0.5 rounded-full font-bold border hidden sm:inline-block"
              style={{
                background: "var(--subtle)",
                borderColor: "var(--border)",
                color: "var(--muted)",
              }}
            >
              v1.2
            </span>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active ? "shadow-sm" : "hover:opacity-80"
                  }`}
                  style={{
                    background: active ? "var(--accent-bg)" : "transparent",
                    color: active ? "var(--accent)" : "var(--muted)",
                    border: active ? "1px solid var(--border)" : "1px solid transparent",
                  }}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Ações da Direita: Botões de Ganho, Gasto, Tema e Perfil */}
          <div className="flex items-center gap-2">
            {/* Botão + Ganho (Verde) */}
            <button
              type="button"
              onClick={() => onOpenNewTx("in")}
              title="Adicionar Ganho"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
              style={{ background: "var(--gain)" }}
            >
              <TrendingUp size={14} />
              <span className="hidden sm:inline">+ Ganho</span>
              <span className="sm:hidden">+G</span>
            </button>

            {/* Botão + Gasto (Coral) */}
            <button
              type="button"
              onClick={() => onOpenNewTx("out")}
              title="Adicionar Gasto"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-xs text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
              style={{ background: "var(--expense)" }}
            >
              <TrendingDown size={14} />
              <span className="hidden sm:inline">+ Gasto</span>
              <span className="sm:hidden">-G</span>
            </button>

            {/* Seletor de Tema */}
            <div
              className="hidden md:flex items-center p-0.5 rounded-full border text-xs ml-1"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <button
                type="button"
                onClick={() => setTheme("light")}
                title="Modo Claro"
                className={`p-1.5 rounded-full transition-all ${
                  theme === "light" ? "shadow-sm font-semibold" : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  background: theme === "light" ? "var(--surface)" : "transparent",
                  color: "var(--text)",
                }}
              >
                <Sun size={13} />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                title="Modo Escuro"
                className={`p-1.5 rounded-full transition-all ${
                  theme === "dark" ? "shadow-sm font-semibold" : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  background: theme === "dark" ? "var(--surface)" : "transparent",
                  color: "var(--text)",
                }}
              >
                <Moon size={13} />
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                title="Automático"
                className={`p-1.5 rounded-full transition-all ${
                  theme === "system" ? "shadow-sm font-semibold" : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  background: theme === "system" ? "var(--surface)" : "transparent",
                  color: "var(--text)",
                }}
              >
                <Laptop size={13} />
              </button>
            </div>

            {/* Menu de Usuário e Logout */}
            <div className="flex items-center gap-1 pl-2 border-l" style={{ borderColor: "var(--border)" }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                style={{
                  background: "var(--subtle)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
                title={profile?.name || user?.email || "Usuário"}
              >
                <User size={14} />
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sair da conta"
                className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ color: "var(--muted)" }}
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Menu Hambúrguer Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg lg:hidden"
              style={{ color: "var(--text)" }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu Retrátil Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t space-y-1.5" style={{ borderColor: "var(--border)" }}>
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold ${
                    active ? "shadow-sm" : ""
                  }`}
                  style={{
                    background: active ? "var(--accent-bg)" : "transparent",
                    color: active ? "var(--accent)" : "var(--muted)",
                  }}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
