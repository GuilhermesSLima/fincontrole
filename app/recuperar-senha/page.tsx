"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function RecuperarSenhaPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/user-not-found": "E-mail não cadastrado.",
        "auth/invalid-email": "E-mail inválido.",
      };
      setError(msg[err.code] || "Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>FinControle</div>
          <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>Recuperação de Acesso</div>
        </div>

        <div
          className="rounded-lg p-8 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}
        >
          {sent ? (
            <div className="text-center space-y-4">
              <div
                className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
                style={{ background: "var(--gain-bg)", color: "var(--gain)" }}
              >
                <CheckCircle2 size={24} />
              </div>
              <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>E-mail enviado!</h1>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Enviamos instruções de redefinição de senha para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 mt-2 rounded-md font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: "var(--text)", color: "var(--surface)" }}
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>Redefinir senha</h1>
              <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
                Digite seu e-mail cadastrado para receber o link de redefinição.
              </p>

              {error && (
                <div
                  className="flex items-center gap-2 p-3 rounded-md text-sm mb-4"
                  style={{ background: "var(--expense-bg)", color: "var(--expense)", border: "1px solid var(--expense-border)" }}
                >
                  <AlertCircle size={15} /> {error}
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "var(--text)", color: "var(--surface)" }}
                >
                  {loading ? "Enviando…" : (
                    <>Enviar link <ArrowRight size={14} /></>
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-75"
                  style={{ color: "var(--accent)" }}
                >
                  <ArrowLeft size={14} /> Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
