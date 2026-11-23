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
        "auth/user-not-found": "E-mail não cadastrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/too-many-requests": "Muitas tentativas. Aguarde alguns instantes.",
        "auth/invalid-credential": "E-mail ou senha incorretos.",
      };
      setError(msg[err.code] || "Erro ao entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-[420px] space-y-6">
        {/* Cabeçalho de Marca */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-md tracking-tight"
              style={{ background: "var(--accent)" }}
            >
              FC
            </span>
            <span className="text-2xl font-black tracking-tight" style={{ color: "var(--text)" }}>
              FinControle
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Gestão Financeira Pessoal com Clareza e Rigor
          </p>
        </div>

        {/* Card do Formulário */}
        <div
          className="fc-card"
          style={{
            padding: "32px 28px",
            boxShadow: "var(--shadow-lg)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Acessar conta
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Insira seu e-mail e senha para continuar
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-2.5 p-3 rounded-lg text-xs font-semibold mb-4"
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
              <label className="fc-label">E-mail</label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="fc-input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="fc-label" style={{ marginBottom: 0 }}>Senha</label>
                <Link
                  href="/recuperar-senha"
                  className="text-xs font-semibold hover:underline"
                  style={{ color: "var(--accent)" }}
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="fc-input"
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="fc-btn fc-btn-primary w-full"
              style={{ padding: "12px", fontSize: "0.9rem", marginTop: 8 }}
            >
              {loading ? (
                <span>Entrando…</span>
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            className="mt-6 pt-5 border-t text-center text-xs font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <span>Ainda não tem conta? </span>
            <Link
              href="/cadastro"
              className="font-bold hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
