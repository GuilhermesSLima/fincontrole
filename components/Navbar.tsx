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
} from "lucide-react";

interface NavbarProps {
  onOpenNewTx: () => void;
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
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* Linha Superior */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo e Versão */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight" style={{ color: "var(--text)" }}>
              <span
                className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black shadow-sm"
                style={{ background: "var(--text)", color: "var(--surface)" }}
              >
                FC
              </span>
              <span>FinControle</span>
            </Link>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold hidden sm:inline-block border"
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
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active ? "font-semibold shadow-sm" : "hover:opacity-80"
                  }`}
                  style={{
                    background: active ? "var(--accent-bg)" : "transparent",
                    color: active ? "var(--accent)" : "var(--muted)",
                    border: active ? "1px solid var(--border)" : "1px solid transparent",
                  }}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2">
            {/* Seletor de Tema */}
            <div
              className="hidden sm:flex items-center p-0.5 rounded-full border text-xs"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <button
                type="button"
                onClick={() => setTheme("light")}
                title="Modo Claro"
                className={`p-1.5 rounded-full transition-all ${theme === "light" ? "shadow-sm font-semibold" : "opacity-60 hover:opacity-100"}`}
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
                className={`p-1.5 rounded-full transition-all ${theme === "dark" ? "shadow-sm font-semibold" : "opacity-60 hover:opacity-100"}`}
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
                className={`p-1.5 rounded-full transition-all ${theme === "system" ? "shadow-sm font-semibold" : "opacity-60 hover:opacity-100"}`}
                style={{
                  background: theme === "system" ? "var(--surface)" : "transparent",
                  color: "var(--text)",
                }}
              >
                <Laptop size={13} />
              </button>
            </div>

            {/* Botão Novo Lançamento */}
            <button
              type="button"
              onClick={onOpenNewTx}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md font-semibold text-xs transition-opacity hover:opacity-90 shadow-sm"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Novo Lançamento</span>
              <span className="sm:hidden">Novo</span>
            </button>

            {/* Usuário e Sair */}
            <div className="flex items-center gap-1 pl-1 border-l" style={{ borderColor: "var(--border)" }}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                style={{ background: "var(--subtle)", color: "var(--text)", border: "1px solid var(--border)" }}
                title={profile?.name || user?.email || "Usuário"}
              >
                <User size={14} />
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sair da conta"
                className="p-1.5 rounded-md transition-colors hover:opacity-80"
                style={{ color: "var(--muted)" }}
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Menu Hambúrguer Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md lg:hidden"
              style={{ color: "var(--text)" }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Retrátil */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                    active ? "font-semibold" : ""
                  }`}
                  style={{
                    background: active ? "var(--accent-bg)" : "transparent",
                    color: active ? "var(--accent)" : "var(--muted)",
                  }}
                >
                  <Icon size={16} />
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
