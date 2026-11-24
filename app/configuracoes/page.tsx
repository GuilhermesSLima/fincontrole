"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useGoals } from "@/lib/hooks/useGoals";
import { Navbar } from "@/components/Navbar";
import { TransactionModal } from "@/components/TransactionModal";
import { Transaction } from "@/types";
import {
  Settings,
  Download,
  Upload,
  User,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  FileJson,
  Lock,
} from "lucide-react";

export default function ConfiguracoesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const { transactions, addTransaction, batchAddTransactions } = useTransactions();
  const { goals } = useGoals();

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
          <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
            Carregando Configurações…
          </span>
        </div>
      </div>
    );
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
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("Processando arquivo...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = (event.target?.result as string || "").trim();
        if (!text) {
          setImportStatus("O arquivo selecionado está vazio.");
          return;
        }

        const raw = JSON.parse(text);
        const rawItems = Array.isArray(raw)
          ? raw
          : raw.transactions && Array.isArray(raw.transactions)
          ? raw.transactions
          : null;

        if (!rawItems || !rawItems.length) {
          setImportStatus("Nenhum lançamento válido encontrado no arquivo JSON.");
          return;
        }

        const toInsert: Omit<Transaction, "id" | "userId" | "createdAt">[] = [];

        for (const item of rawItems) {
          if (item && item.desc && item.amount !== undefined && item.date) {
            const cleanItem: any = {
              desc: String(item.desc).trim(),
              amount: Math.abs(parseFloat(item.amount) || 0),
              type: item.type === "in" ? "in" : "out",
              cat: String(item.cat || (item.type === "in" ? "Outros ganhos" : "Outros gastos")).trim(),
              date: String(item.date).slice(0, 10),
              done: !!item.done,
            };

            if (item.seriesId) cleanItem.seriesId = String(item.seriesId);
            if (item.seriesIndex || item.installmentIndex) {
              cleanItem.seriesIndex = Number(item.seriesIndex || item.installmentIndex);
            }
            if (item.seriesTotal || item.installmentTotal) {
              cleanItem.seriesTotal = Number(item.seriesTotal || item.installmentTotal);
            }

            toInsert.push(cleanItem);
          }
        }

        if (!toInsert.length) {
          setImportStatus("Nenhum lançamento com descrição, valor e data válidos foi encontrado.");
          return;
        }

        const count = await batchAddTransactions(toInsert);
        setImportStatus(`✅ Sucesso! ${count} lançamentos importados com sucesso para sua conta.`);
      } catch (err: any) {
        console.error("Erro detalhado da importação:", err);
        if (err?.code === "permission-denied" || err?.message?.includes("Missing or insufficient permissions")) {
          setImportStatus("⚠️ Erro de permissão no Firebase. As regras de segurança do Firestore ainda precisam ser publicadas no Firebase Console.");
        } else {
          setImportStatus(`Erro ao importar: ${err?.message || "Verifique o formato do arquivo."}`);
        }
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar onOpenNewTx={() => setIsTxModalOpen(true)} />

      <main className="fc-container space-y-6">
        {/* Cabeçalho */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>
              Preferências &amp; Dados
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text)" }}>
            Configurações e Premissas
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Gerencie seu perfil, aparência do sistema e faça backup ou restauração de dados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card: Perfil & Conta */}
          <div className="fc-card space-y-4">
            <div className="fc-card-header">
              <h2 className="fc-card-title">
                <User size={18} style={{ color: "var(--accent)" }} />
                <span>Perfil do Usuário</span>
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="fc-label">Nome de Exibição</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.name || "Usuário FinControle"}
                  className="fc-input"
                  style={{ background: "var(--subtle)" }}
                />
              </div>

              <div>
                <label className="fc-label">E-mail Cadastrado</label>
                <input
                  type="email"
                  readOnly
                  value={user.email || ""}
                  className="fc-input"
                  style={{ background: "var(--subtle)" }}
                />
              </div>

              <div
                className="p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold"
                style={{
                  background: "var(--gain-bg)",
                  borderColor: "var(--gain-border)",
                  color: "var(--gain-text)",
                }}
              >
                <ShieldCheck size={18} style={{ color: "var(--gain)" }} />
                <span>Isolamento Ativo: seus dados são privados e acessíveis apenas por você.</span>
              </div>
            </div>
          </div>

          {/* Card: Aparência e Tema */}
          <div className="fc-card space-y-4">
            <div className="fc-card-header">
              <h2 className="fc-card-title">
                <Sun size={18} style={{ color: "var(--accent)" }} />
                <span>Aparência e Tema</span>
              </h2>
            </div>

            <div className="space-y-3">
              <label className="fc-label">Esquema de Cores</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    theme === "light" ? "border-blue-600 shadow-sm" : ""
                  }`}
                  style={{
                    background: theme === "light" ? "var(--accent-bg)" : "var(--surface)",
                    color: theme === "light" ? "var(--accent)" : "var(--text)",
                    borderColor: theme === "light" ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <Sun size={20} />
                  <span className="text-xs font-bold">Claro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    theme === "dark" ? "border-blue-600 shadow-sm" : ""
                  }`}
                  style={{
                    background: theme === "dark" ? "var(--accent-bg)" : "var(--surface)",
                    color: theme === "dark" ? "var(--accent)" : "var(--text)",
                    borderColor: theme === "dark" ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <Moon size={20} />
                  <span className="text-xs font-bold">Escuro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    theme === "system" ? "border-blue-600 shadow-sm" : ""
                  }`}
                  style={{
                    background: theme === "system" ? "var(--accent-bg)" : "var(--surface)",
                    color: theme === "system" ? "var(--accent)" : "var(--text)",
                    borderColor: theme === "system" ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <Laptop size={20} />
                  <span className="text-xs font-bold">Auto</span>
                </button>
              </div>

              <p className="text-xs pt-1" style={{ color: "var(--text-muted)" }}>
                O modo Automático acompanha o tema configurado no seu sistema operacional.
              </p>
            </div>
          </div>
        </div>

        {/* Card: Backup e Importação de Dados */}
        <div className="fc-card space-y-4">
          <div className="fc-card-header">
            <div>
              <h2 className="fc-card-title">
                <FileJson size={18} style={{ color: "var(--accent)" }} />
                <span>Backup e Migração de Dados (JSON)</span>
              </h2>
              <p className="fc-card-subtitle">
                Faça download de todas as suas movimentações ou importe dados do HTML anterior.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Exportar */}
            <div
              className="p-5 rounded-xl border space-y-3"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <Download size={18} style={{ color: "var(--accent)" }} />
                <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>Exportar Dados</h3>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Gere um arquivo JSON com todas as suas {transactions.length} transações e {goals.length} metas cadastradas.
              </p>
              <button
                type="button"
                onClick={handleExportJSON}
                className="fc-btn fc-btn-primary fc-btn-sm font-bold"
              >
                <Download size={14} />
                <span>Baixar Backup Completo</span>
              </button>
            </div>

            {/* Importar */}
            <div
              className="p-5 rounded-xl border space-y-3"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <Upload size={18} style={{ color: "var(--gain)" }} />
                <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>Importar Dados</h3>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Importe dados de um backup anterior ou da versão HTML local (compatível com o formato JSON).
              </p>
              <label className="fc-btn fc-btn-secondary fc-btn-sm font-bold cursor-pointer inline-flex">
                <Upload size={14} />
                <span>Selecionar Arquivo JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              {importStatus && (
                <p className="text-xs font-bold pt-1" style={{ color: "var(--gain)" }}>
                  {importStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Transação */}
      {isTxModalOpen && (
        <TransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          onSubmit={async (data) => {
            await addTransaction(data);
          }}
        />
      )}
    </div>
  );
}
