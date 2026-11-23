"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/user-not-found": "E-mail não encontrado.",
        "auth/invalid-email": "E-mail inválido.",
      };
      setError(msg[err.code] || "Erro ao enviar e-mail de recuperação.");
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
            Recuperação segura de acesso à conta
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
              Recuperar senha
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Digite seu e-mail para receber as instruções de redefinição
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

          {success ? (
            <div
              className="p-4 rounded-xl border text-center space-y-3"
              style={{
                background: "var(--gain-bg)",
                borderColor: "var(--gain-border)",
                color: "var(--gain-text)",
              }}
            >
              <CheckCircle2 size={32} className="mx-auto" style={{ color: "var(--gain)" }} />
              <div>
                <p className="text-sm font-bold">E-mail de recuperação enviado!</p>
                <p className="text-xs mt-1">
                  Verifique sua caixa de entrada e siga o link enviado para cadastrar uma nova senha.
                </p>
              </div>
              <Link
                href="/login"
                className="fc-btn fc-btn-primary fc-btn-sm inline-flex mt-2"
              >
                Voltar para o Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="fc-label">E-mail Cadastrado</label>
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

              <button
                type="submit"
                disabled={loading}
                className="fc-btn fc-btn-primary w-full"
                style={{ padding: "12px", fontSize: "0.9rem", marginTop: 8 }}
              >
                {loading ? (
                  <span>Enviando link…</span>
                ) : (
                  <>
                    <span>Enviar instruções</span>
                    <Send size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          <div
            className="mt-6 pt-5 border-t text-center text-xs font-medium"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-bold hover:underline"
              style={{ color: "var(--accent)" }}
            >
              <ArrowLeft size={14} />
              <span>Voltar para o Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
