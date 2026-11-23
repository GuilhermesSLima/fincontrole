"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useGoals } from "@/lib/hooks/useGoals";
import { Navbar } from "@/components/Navbar";
import { TransactionModal } from "@/components/TransactionModal";
import {
  Settings,
  Download,
  Upload,
  User,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  FileJson,
  Users,
  Camera,
} from "lucide-react";

export default function ConfiguracoesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const { transactions, addTransaction, addSeries } = useTransactions();
  const { goals } = useGoals();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <span className="text-sm" style={{ color: "var(--muted)" }}>Carregando…</span>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  // Exportar backup completo em JSON
  const handleExportJSON = () => {
    const data = {
      version: "1.2",
      exportedAt: new Date().toISOString(),
      user: {
        uid: user.uid,
        email: user.email,
        name: profile?.name,
      },
      transactions,
      goals,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fincontrole_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importar arquivo JSON (backup ou do HTML antigo)
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        let importedCount = 0;

        // Se for array simples (localStorage do HTML antigo)
        if (Array.isArray(raw)) {
          for (const item of raw) {
            if (item.desc && item.amount && item.date) {
              await addTransaction({
                desc: item.desc,
                amount: item.amount,
                type: item.type === "in" ? "in" : "out",
                cat: item.cat || "Outros",
                date: item.date,
                done: !!item.done,
              });
              importedCount++;
            }
          }
        } else if (raw.transactions && Array.isArray(raw.transactions)) {
          // Backup do FinControle v1.2
          for (const item of raw.transactions) {
            await addTransaction({
              desc: item.desc,
              amount: item.amount,
              type: item.type,
              cat: item.cat,
              date: item.date,
              done: !!item.done,
              seriesId: item.seriesId,
              seriesIndex: item.seriesIndex,
              seriesTotal: item.seriesTotal,
            });
            importedCount++;
          }
        }

        setImportStatus(`Importação concluída com sucesso! ${importedCount} lançamentos adicionados.`);
      } catch (err) {
        setImportStatus("Erro ao processar arquivo JSON. Verifique a formatação.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar onOpenNewTx={() => setIsTxModalOpen(true)} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Cabeçalho */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>
              Parâmetros do Sistema
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span className="text-xs" style={{ color: "var(--muted)" }}>Preferências &amp; Migração de Dados</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações Gerais</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Personalize sua experiência, exporte seus dados e gerencie a segurança da sua conta.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card: Perfil & Preferências */}
          <section
            className="rounded-xl p-5 border shadow-sm space-y-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <User size={18} style={{ color: "var(--accent)" }} />
              <h2 className="text-sm font-bold">Perfil do Usuário</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--muted)" }}>
                  Nome
                </label>
                <input
                  type="text"
                  disabled
                  value={profile?.name || user.displayName || "Usuário"}
                  className="w-full px-3 py-2 rounded-md border opacity-80"
                  style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--muted)" }}>
                  E-mail Cadastrado
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email || ""}
                  className="w-full px-3 py-2 rounded-md border opacity-80"
                  style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              {/* Tema da Interface */}
              <div className="pt-2">
                <label className="block font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--muted)" }}>
                  Tema da Interface
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`py-2 rounded-md border flex items-center justify-center gap-1.5 font-medium transition-all ${
                      theme === "light" ? "font-bold shadow-sm" : "opacity-75"
                    }`}
                    style={{
                      background: theme === "light" ? "var(--accent-bg)" : "var(--subtle)",
                      color: theme === "light" ? "var(--accent)" : "var(--text)",
                      borderColor: theme === "light" ? "var(--border-focus)" : "var(--border)",
                    }}
                  >
                    <Sun size={14} />
                    <span>Claro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`py-2 rounded-md border flex items-center justify-center gap-1.5 font-medium transition-all ${
                      theme === "dark" ? "font-bold shadow-sm" : "opacity-75"
                    }`}
                    style={{
                      background: theme === "dark" ? "var(--accent-bg)" : "var(--subtle)",
                      color: theme === "dark" ? "var(--accent)" : "var(--text)",
                      borderColor: theme === "dark" ? "var(--border-focus)" : "var(--border)",
                    }}
                  >
                    <Moon size={14} />
                    <span>Escuro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`py-2 rounded-md border flex items-center justify-center gap-1.5 font-medium transition-all ${
                      theme === "system" ? "font-bold shadow-sm" : "opacity-75"
                    }`}
                    style={{
                      background: theme === "system" ? "var(--accent-bg)" : "var(--subtle)",
                      color: theme === "system" ? "var(--accent)" : "var(--text)",
                      borderColor: theme === "system" ? "var(--border-focus)" : "var(--border)",
                    }}
                  >
                    <Laptop size={14} />
                    <span>Auto</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Anotações das Próximas Evoluções Combinadas */}
            <div className="p-3.5 rounded-lg border space-y-2 mt-4 text-xs" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
              <span className="font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
                Roadmap de Evoluções Anotadas
              </span>
              <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <Users size={15} style={{ color: "var(--accent)" }} />
                <span><strong>Interligação de Usuários:</strong> Compartilhamento seguro entre cônjuges ou sócios.</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                <Camera size={15} style={{ color: "var(--accent)" }} />
                <span><strong>Avatar / Foto de Perfil:</strong> Upload direto de imagem para personalização.</span>
              </div>
            </div>
          </section>

          {/* Card: Exportação e Importação de Dados */}
          <section
            className="rounded-xl p-5 border shadow-sm space-y-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <FileJson size={18} style={{ color: "var(--accent)" }} />
              <h2 className="text-sm font-bold">Backup, Exportação &amp; Importação</h2>
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Faça backup completo em formato JSON ou traga lançamentos salvos no modelo HTML antigo.
            </p>

            {importStatus && (
              <div
                className="flex items-center gap-2 p-3 rounded-md text-xs font-medium"
                style={{ background: "var(--gain-bg)", color: "var(--gain)", border: "1px solid var(--gain-border)" }}
              >
                <CheckCircle2 size={16} />
                <span>{importStatus}</span>
              </div>
            )}

            <div className="space-y-3 pt-1">
              {/* Botão de Exportar */}
              <div className="p-3.5 rounded-lg border flex items-center justify-between gap-3" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                <div>
                  <span className="font-bold text-xs block">Exportar Backup Completo (JSON)</span>
                  <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                    Inclui {transactions.length} transações e {goals.length} metas cadastradas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold text-xs border transition-opacity hover:opacity-80"
                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  <Download size={14} />
                  <span>Baixar JSON</span>
                </button>
              </div>

              {/* Botão de Importar */}
              <div className="p-3.5 rounded-lg border space-y-2" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs block">Importar Dados (JSON)</span>
                    <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                      Compatível com o formato exportado ou array do localStorage
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-md font-semibold text-xs text-white cursor-pointer transition-opacity hover:opacity-90 shadow-sm" style={{ background: "var(--accent)" }}>
                    <Upload size={14} />
                    <span>Selecionar Arquivo</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Informações de Integridade */}
            <div className="flex items-center gap-2 text-xs pt-2" style={{ color: "var(--gain)" }}>
              <ShieldCheck size={16} />
              <span>Seus dados são criptografados e isolados no Cloud Firestore por UID.</span>
            </div>
          </section>
        </div>
      </main>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSaveSingle={addTransaction}
        onSaveSeries={addSeries}
      />
    </div>
  );
}
