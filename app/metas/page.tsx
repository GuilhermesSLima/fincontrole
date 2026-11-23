"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals } from "@/lib/hooks/useGoals";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { Navbar } from "@/components/Navbar";
import { GoalModal } from "@/components/GoalModal";
import { TransactionModal } from "@/components/TransactionModal";
import { Goal } from "@/types";
import { brl, pct } from "@/lib/utils";
import {
  ShieldAlert,
  Target,
  Plus,
  TrendingUp,
  Edit2,
  Trash2,
  CheckCircle2,
  Lock,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function MetasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { goals, loading: goalsLoading, addGoal, updateGoal, deleteGoal, addContribution } = useGoals();
  const { addTransaction, addSeries } = useTransactions();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // Modal rápido de aporte
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [contribAmountStr, setContribAmountStr] = useState("");

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

  const emergencyFunds = goals.filter((g) => g.type === "emergency");
  const specificGoals = goals.filter((g) => g.type === "goal");

  const handleOpenEdit = (g: Goal) => {
    setEditingGoal(g);
    setIsGoalModalOpen(true);
  };

  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
  };

  const handleQuickContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoal) return;
    const val = parseFloat(contribAmountStr.replace(/\./g, "").replace(",", ".")) || 0;
    if (val <= 0) return;

    await addContribution(contributeGoal.id, val);
    setContributeGoal(null);
    setContribAmountStr("");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar onOpenNewTx={() => setIsTxModalOpen(true)} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>
                Planejamento Patrimonial
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className="text-xs" style={{ color: "var(--muted)" }}>Gestão de Liquidez Segregada</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Metas &amp; Reservas Financeiras</h1>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Acompanhe seu fundo de segurança e seus objetivos de médio/longo prazo de forma completamente segregada.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs text-white transition-opacity hover:opacity-90 shadow-sm"
              style={{ background: "var(--accent)" }}
            >
              <Plus size={15} />
              <span>Novo Objetivo / Fundo</span>
            </button>
          </div>
        </div>

        {/* Banner da Regra de Ouro (Exigência do Projeto) */}
        <div
          className="rounded-xl p-4 border flex items-center justify-between gap-4 shadow-sm"
          style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-none"
              style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider block" style={{ color: "var(--accent)" }}>
                Regra de Ouro da Metodologia
              </span>
              <p className="text-xs mt-0.5" style={{ color: "var(--text)" }}>
                O <strong>Fundo de Emergência</strong> e a <strong>Meta Principal</strong> nunca se misturam. Cada um possui propósito e conta isolados.
              </p>
            </div>
          </div>
        </div>

        {/* Grade de Alocação: Fundo de Emergência e Metas Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seção 1: Fundos de Emergência */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent)" }} />
                <h2 className="text-sm font-bold uppercase tracking-wider">Fundo de Emergência (Liquidez Imediata)</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                {emergencyFunds.length} {emergencyFunds.length === 1 ? "fundo" : "fundos"}
              </span>
            </div>

            {emergencyFunds.length === 0 ? (
              <div
                className="rounded-xl p-8 border text-center space-y-3"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                >
                  <Lock size={20} />
                </div>
                <h3 className="font-bold text-sm">Nenhum fundo de emergência cadastrado</h3>
                <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--muted)" }}>
                  Crie seu fundo para cobrir de 3 a 6 meses dos seus custos fixos essenciais em investimentos com liquidez diária.
                </p>
                <button
                  type="button"
                  onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm"
                  style={{ background: "var(--accent)" }}
                >
                  Criar Fundo de Emergência
                </button>
              </div>
            ) : (
              emergencyFunds.map((g) => {
                const progress = pct(g.currentAmount, g.targetAmount);
                const remaining = Math.max(0, g.targetAmount - g.currentAmount);

                return (
                  <div
                    key={g.id}
                    className="rounded-xl p-5 border shadow-sm relative overflow-hidden space-y-4"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: "var(--accent)" }} />

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border tracking-wide" style={{ background: "var(--accent-bg)", color: "var(--accent)", borderColor: "var(--border)" }}>
                          Prioridade Máxima
                        </span>
                        <h3 className="text-base font-bold mt-1.5">{g.name}</h3>
                        {g.description && <p className="text-xs" style={{ color: "var(--muted)" }}>{g.description}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1.5 rounded-md hover:opacity-80"
                          style={{ color: "var(--muted)" }}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1.5 rounded-md hover:text-red-500"
                          style={{ color: "var(--muted)" }}
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Bloco de Valores */}
                    <div className="p-4 rounded-xl border flex items-baseline justify-between gap-3" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
                          Valor Acumulado
                        </span>
                        <div className="text-2xl font-black tabular mt-0.5" style={{ color: "var(--accent)" }}>
                          {brl(g.currentAmount)}
                        </div>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          de {brl(g.targetAmount)} alvo
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
                          Restante
                        </span>
                        <div className="text-lg font-bold tabular mt-0.5" style={{ color: "var(--expense)" }}>
                          {brl(remaining)}
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span style={{ color: "var(--muted)" }}>Progresso da Reserva</span>
                        <span style={{ color: "var(--accent)" }}>{progress}% atingido</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--subtle)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, background: "var(--accent)" }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1" style={{ color: "var(--muted)" }}>
                        {g.monthlyContribution > 0 && (
                          <span>Aporte: <strong>{brl(g.monthlyContribution)}/mês</strong></span>
                        )}
                        {g.deadline && (
                          <span>Prazo: <strong>{g.deadline}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Ação rápida de depósito/aporte */}
                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setContributeGoal(g); setContribAmountStr(g.monthlyContribution ? g.monthlyContribution.toString() : ""); }}
                        className="flex-1 py-2 rounded-lg font-semibold text-xs border flex items-center justify-center gap-1.5 transition-colors hover:opacity-80"
                        style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        <TrendingUp size={14} style={{ color: "var(--gain)" }} />
                        <span>Registrar Aporte</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Seção 2: Metas Específicas / Ilimitadas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--gain)" }} />
                <h2 className="text-sm font-bold uppercase tracking-wider">Objetivos e Metas Pessoais (Ilimitadas)</h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                {specificGoals.length} {specificGoals.length === 1 ? "meta" : "metas"}
              </span>
            </div>

            {specificGoals.length === 0 ? (
              <div
                className="rounded-xl p-8 border text-center space-y-3"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: "var(--gain-bg)", color: "var(--gain)" }}
                >
                  <Target size={20} />
                </div>
                <h3 className="font-bold text-sm">Nenhuma meta específica cadastrada</h3>
                <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--muted)" }}>
                  Defina viagens, compras planejadas, cursos ou projetos com prazos e valores-alvo transparentes.
                </p>
                <button
                  type="button"
                  onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm"
                  style={{ background: "var(--gain)" }}
                >
                  Criar Nova Meta
                </button>
              </div>
            ) : (
              specificGoals.map((g) => {
                const progress = pct(g.currentAmount, g.targetAmount);
                const remaining = Math.max(0, g.targetAmount - g.currentAmount);

                return (
                  <div
                    key={g.id}
                    className="rounded-xl p-5 border shadow-sm relative overflow-hidden space-y-4"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: "var(--gain)" }} />

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border tracking-wide" style={{ background: "var(--gain-bg)", color: "var(--gain)", borderColor: "var(--gain-border)" }}>
                          Objetivo Específico
                        </span>
                        <h3 className="text-base font-bold mt-1.5">{g.name}</h3>
                        {g.description && <p className="text-xs" style={{ color: "var(--muted)" }}>{g.description}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1.5 rounded-md hover:opacity-80"
                          style={{ color: "var(--muted)" }}
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteGoal(g.id)}
                          className="p-1.5 rounded-md hover:text-red-500"
                          style={{ color: "var(--muted)" }}
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Bloco de Valores */}
                    <div className="p-4 rounded-xl border flex items-baseline justify-between gap-3" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
                          Valor Acumulado
                        </span>
                        <div className="text-2xl font-black tabular mt-0.5" style={{ color: "var(--gain)" }}>
                          {brl(g.currentAmount)}
                        </div>
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          de {brl(g.targetAmount)} alvo
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
                          Restante
                        </span>
                        <div className="text-lg font-bold tabular mt-0.5" style={{ color: "var(--text)" }}>
                          {brl(remaining)}
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span style={{ color: "var(--muted)" }}>Progresso da Meta</span>
                        <span style={{ color: "var(--gain)" }}>{progress}% atingido</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--subtle)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, background: "var(--gain)" }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1" style={{ color: "var(--muted)" }}>
                        {g.monthlyContribution > 0 && (
                          <span>Aporte: <strong>{brl(g.monthlyContribution)}/mês</strong></span>
                        )}
                        {g.deadline && (
                          <span>Prazo: <strong>{g.deadline}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Ação rápida de depósito/aporte */}
                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setContributeGoal(g); setContribAmountStr(g.monthlyContribution ? g.monthlyContribution.toString() : ""); }}
                        className="flex-1 py-2 rounded-lg font-semibold text-xs border flex items-center justify-center gap-1.5 transition-colors hover:opacity-80"
                        style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        <TrendingUp size={14} style={{ color: "var(--gain)" }} />
                        <span>Registrar Aporte</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Modal de Criação / Edição de Metas */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={handleCloseGoalModal}
        onSave={addGoal}
        onUpdate={updateGoal}
        initialData={editingGoal}
      />

      {/* Modal Rápido de Aporte */}
      {contributeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-xl border p-5 space-y-4 shadow-2xl modal-animate"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h3 className="font-bold text-sm">Registrar Aporte — {contributeGoal.name}</h3>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Informe o valor que você guardou agora nesta reserva:
            </p>
            <form onSubmit={handleQuickContribution} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  Valor do Aporte (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={contribAmountStr}
                  onChange={(e) => setContribAmountStr(e.target.value)}
                  placeholder="0,00"
                  required
                  autoFocus
                  className="w-full px-3 py-2 text-sm rounded-md border font-semibold tabular outline-none"
                  style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContributeGoal(null)}
                  className="flex-1 py-2 rounded-md text-xs font-semibold border"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-md text-xs font-semibold text-white shadow-sm"
                  style={{ background: "var(--gain)" }}
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Novo Lançamento Global */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSaveSingle={addTransaction}
        onSaveSeries={addSeries}
      />
    </div>
  );
}
