"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

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
        "auth/user-not-found": "E-mail não cadastrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/too-many-requests": "Muitas tentativas. Aguarde alguns instantes.",
        "auth/invalid-credential": "E-mail ou senha incorretos.",
      };
      setError(msg[err.code] || "Erro ao entrar. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-[440px] space-y-6">
        {/* Cabeçalho de Marca */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-md tracking-tight"
              style={{ background: "var(--accent)", color: "#ffffff" }}
            >
              FC
            </span>
            <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
              FinControle
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium" style={{ color: "var(--muted)" }}>
            Gestão Financeira Pessoal com Rigor e Clareza
          </p>
        </div>

        {/* Card do Formulário */}
        <div
          className="rounded-2xl p-6 sm:p-8 border shadow-lg backdrop-blur-sm space-y-6"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Acessar sua conta
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--muted)" }}>
              Digite suas credenciais para gerenciar suas finanças
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-2.5 p-3 rounded-lg text-xs font-semibold"
              style={{
                background: "var(--expense-bg)",
                color: "var(--expense)",
                border: "1px solid var(--expense-border)",
              }}
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--muted)" }}
              >
                E-mail
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border outline-none transition-all font-medium"
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
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--muted)" }}
                >
                  Senha
                </label>
                <Link
                  href="/recuperar-senha"
                  className="text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: "var(--accent)" }}
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted)" }}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border outline-none transition-all font-medium"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "var(--muted)" }}
                  title={showPwd ? "Ocultar senha" : "Ver senha"}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60 shadow-md mt-2"
              style={{ background: "var(--accent)" }}
            >
              {loading ? (
                <span>Autenticando…</span>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            className="pt-4 border-t text-center text-xs sm:text-sm font-medium"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            Ainda não tem conta?{" "}
            <Link
              href="/cadastro"
              className="font-bold transition-opacity hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              Criar conta gratuita
            </Link>
          </div>
        </div>

        {/* Garantia de Privacidade */}
        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
          <ShieldCheck size={14} style={{ color: "var(--gain)" }} />
          <span>Dados criptografados e isolados com Firebase Security</span>
        </div>
      </div>
    </div>
  );
}
