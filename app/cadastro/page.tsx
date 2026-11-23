"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name.trim());
      router.replace("/dashboard");
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/email-already-in-use": "Este e-mail já está em uso.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/weak-password": "A senha é muito fraca (mínimo 6 caracteres).",
      };
      setError(msg[err.code] || "Erro ao criar conta. Tente novamente.");
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
            Controle financeiro seguro, inteligente e isolado
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
              Criar sua conta
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Comece a gerenciar suas finanças gratuitamente
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
              <label className="fc-label">Nome Completo</label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome"
                  className="fc-input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

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
              <label className="fc-label">Senha</label>
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
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label className="fc-label">Confirmar Senha</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type={showPwd ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repita sua senha"
                  className="fc-input"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="fc-btn fc-btn-primary w-full"
              style={{ padding: "12px", fontSize: "0.9rem", marginTop: 8 }}
            >
              {loading ? (
                <span>Criando conta…</span>
              ) : (
                <>
                  <span>Criar conta</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div
            className="mt-6 pt-5 border-t text-center text-xs font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <span>Já tem uma conta? </span>
            <Link
              href="/login"
              className="font-bold hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
