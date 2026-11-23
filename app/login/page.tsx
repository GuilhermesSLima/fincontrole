"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/user-not-found": "E-mail não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/too-many-requests": "Muitas tentativas. Aguarde e tente novamente.",
        "auth/invalid-credential": "E-mail ou senha incorretos.",
      };
      setError(msg[err.code] || "Erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Painel lateral decorativo — oculto no mobile */}
      <div
        className="hidden lg:flex flex-col justify-between w-96 p-10"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        <div>
          <div className="text-2xl font-bold tracking-tight">FinControle</div>
          <div className="mt-1 text-sm opacity-75">Gestão Financeira Pessoal</div>
        </div>
        <div className="space-y-6">
          {[
            { label: "Controle de ganhos e gastos", desc: "Registre e acompanhe cada lançamento" },
            { label: "Metas e fundo de emergência", desc: "Objetivos separados com barras de progresso" },
            { label: "Visão de 13 meses", desc: "Planejamento de longo prazo com clareza" },
          ].map((f) => (
            <div key={f.label} className="flex gap-3 items-start">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-white opacity-70 flex-none" />
              <div>
                <div className="font-semibold text-sm">{f.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs opacity-50">© 2025 FinControle</div>
      </div>

      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="lg:hidden mb-8 text-center">
            <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>FinControle</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>Gestão Financeira Pessoal</div>
          </div>

          <div
            className="rounded-lg p-8 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}
          >
            <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>Entrar na conta</h1>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              Insira seu e-mail e senha para continuar
            </p>

            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-md text-sm mb-4"
                style={{ background: "var(--expense-bg)", color: "var(--expense)", border: "1px solid var(--expense-border)" }}
              >
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  E-mail
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border outline-none transition-all"
                    style={{
                      background: "var(--subtle)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  Senha
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-md border outline-none transition-all"
                    style={{
                      background: "var(--subtle)",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted)" }}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/recuperar-senha"
                  className="text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: "var(--accent)" }}
                >
                  Esqueci minha senha
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--text)", color: "var(--surface)" }}
              >
                {loading ? "Entrando…" : (
                  <>Entrar <ArrowRight size={14} /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-semibold" style={{ color: "var(--accent)" }}>
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
