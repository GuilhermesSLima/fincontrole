"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

export default function CadastroPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6) { setError("A senha deve ter ao menos 6 caracteres."); return; }
    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace("/dashboard");
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/email-already-in-use": "Este e-mail já está cadastrado.",
        "auth/invalid-email": "E-mail inválido.",
        "auth/weak-password": "Senha muito fraca. Use ao menos 6 caracteres.",
      };
      setError(msg[err.code] || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "var(--subtle)",
    borderColor: "var(--border)",
    color: "var(--text)",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold" style={{ color: "var(--text)" }}>FinControle</div>
          <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>Criar uma conta gratuita</div>
        </div>

        <div
          className="rounded-lg p-8 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}
        >
          <h1 className="text-xl font-bold mb-1" style={{ color: "var(--text)" }}>Criar conta</h1>
          <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Preencha os dados abaixo para começar</p>

          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-md text-sm mb-4"
              style={{ background: "var(--expense-bg)", color: "var(--expense)", border: "1px solid var(--expense-border)" }}
            >
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Nome completo", value: name, set: setName, type: "text", icon: User, placeholder: "Seu nome" },
              { label: "E-mail", value: email, set: setEmail, type: "email", icon: Mail, placeholder: "seu@email.com" },
            ].map(({ label, value, set, type, icon: Icon, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  {label}
                </label>
                <div className="relative">
                  <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    required
                    placeholder={placeholder}
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-md border outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>
            ))}

            {[
              { label: "Senha", value: password, set: setPassword, placeholder: "Mínimo 6 caracteres" },
              { label: "Confirmar senha", value: confirm, set: setConfirm, placeholder: "Repita a senha" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  {label}
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    required
                    placeholder={placeholder}
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-md border outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: "var(--muted)" }}
            >
              {showPwd ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPwd ? "Ocultar senhas" : "Mostrar senhas"}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Criando conta…" : (
                <>Criar conta <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
            Já tem uma conta?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--accent)" }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
