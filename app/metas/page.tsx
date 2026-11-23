"use client";

import { useState, useEffect } from "react";
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
  ShieldCheck,
  X,
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
            Carregando Metas…
          </span>
        </div>
      </div>
    );
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

      <main className="fc-container space-y-6">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>
                Planejamento Patrimonial
              </span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--border-hover)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Gestão de Liquidez Segregada
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text)" }}>
              Metas &amp; Reservas Financeiras
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Acompanhe seu fundo de segurança e seus objetivos de médio/longo prazo de forma completamente segregada.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            className="fc-btn fc-btn-primary shadow-sm"
          >
            <Plus size={16} />
            <span>Novo Objetivo</span>
          </button>
        </div>

        {/* Banner da Regra de Ouro */}
        <div className="fc-golden-rule-banner">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--surface)", color: "var(--accent)" }}
          >
            <ShieldCheck size={22} />
          </div>
          <div className="flex-1">
            <span className="font-bold text-sm block">Regra de Ouro:</span>
            <span className="text-xs opacity-90">
              O Fundo de Emergência e as Metas Principais nunca se misturam. Cada um possui conta e propósito isolados para garantir que imprevistos não destruam seus sonhos de longo prazo.
            </span>
          </div>
        </div>

        {/* Grade de Alocação em 2 Colunas Maiores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUNA 1: FUNDO DE EMERGÊNCIA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="fc-badge fc-badge-accent">Prioridade Máxima</span>
                <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                  Fundo de Emergência
                </h2>
              </div>
              {emergencyFunds.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingGoal({
                      id: "",
                      userId: user.uid,
                      name: "Fundo de Emergência",
                      type: "emergency",
                      targetAmount: 6000,
                      currentAmount: 0,
                      monthlyContribution: 300,
                      status: "active",
                      createdAt: Date.now(),
                      updatedAt: Date.now(),
                    });
                    setIsGoalModalOpen(true);
                  }}
                  className="fc-btn fc-btn-secondary fc-btn-sm"
                >
                  <Plus size={13} /> Criar Fundo
                </button>
              )}
            </div>

            {emergencyFunds.length === 0 ? (
              <div
                className="p-8 rounded-2xl border border-dashed text-center space-y-3"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                >
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>
                    Nenhum Fundo de Emergência configurado
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    A recomendação de segurança é reservar de 3 a 6 meses do seu custo de vida essencial.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingGoal(null);
                    setIsGoalModalOpen(true);
                  }}
                  className="fc-btn fc-btn-primary fc-btn-sm inline-flex mt-2"
                >
                  <Plus size={14} /> Configurar Fundo de Emergência
                </button>
              </div>
            ) : (
              emergencyFunds.map((ef) => {
                const progressPct = pct(ef.currentAmount, ef.targetAmount);
                const remaining = Math.max(0, ef.targetAmount - ef.currentAmount);

                return (
                  <div
                    key={ef.id}
                    className="fc-card"
                    style={{
                      borderTop: "4px solid var(--accent)",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1.5" style={{ background: "var(--accent-bg)", color: "var(--accent)" }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
                          RESERVA DE SEGURANÇA
                        </div>
                        <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>{ef.name}</h3>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Segurança imediata para custos essenciais
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ef)}
                          className="fc-tx-action-btn"
                          title="Editar Fundo"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGoal(ef.id)}
                          className="fc-tx-action-btn delete"
                          title="Excluir Fundo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Bloco de Métricas */}
                    <div
                      className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-3 mb-4"
                      style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
                    >
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                          Valor Acumulado
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-2xl font-black num-tabular" style={{ color: "var(--text)" }}>
                            {brl(ef.currentAmount)}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                            / {brl(ef.targetAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                          Faltam
                        </span>
                        <span className="text-base font-bold num-tabular" style={{ color: "var(--expense)" }}>
                          {brl(remaining)}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span style={{ color: "var(--text-muted)" }}>Progresso da Reserva</span>
                        <span style={{ color: "var(--accent)" }}>{progressPct}% atingido</span>
                      </div>
                      <div className="w-full h-3 rounded-full overflow-hidden p-0.5 border" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, progressPct)}%`,
                            background: "var(--accent)",
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1" style={{ color: "var(--text-muted)" }}>
                        <span>Aporte sugerido: <strong>{brl(ef.monthlyContribution || 0)}/mês</strong></span>
                        {ef.deadline && (
                          <span>Previsão: <strong>{ef.deadline.split("-").reverse().join("/")}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Botão de Ação Rápida */}
                    <div className="pt-3 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setContributeGoal(ef);
                          setContribAmountStr("");
                        }}
                        className="fc-btn fc-btn-primary fc-btn-sm flex-1 font-bold"
                      >
                        <TrendingUp size={14} />
                        <span>+ Registrar Aporte no Fundo</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* COLUNA 2: METAS & OBJETIVOS PRINCIPAIS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="fc-badge fc-badge-gain">Objetivos Específicos</span>
                <h2 className="text-lg font-bold" style={{ color: "var(--text)" }}>
                  Metas Principais
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingGoal(null);
                  setIsGoalModalOpen(true);
                }}
                className="fc-btn fc-btn-secondary fc-btn-sm"
              >
                <Plus size={13} /> Nova Meta
              </button>
            </div>

            {specificGoals.length === 0 ? (
              <div
                className="p-8 rounded-2xl border border-dashed text-center space-y-3"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: "var(--gain-bg)", color: "var(--gain)" }}
                >
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--text)" }}>
                    Nenhuma meta principal cadastrada
                  </h3>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Defina objetivos de curto, médio ou longo prazo (viagens, cursos, carro, reforma).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingGoal(null);
                    setIsGoalModalOpen(true);
                  }}
                  className="fc-btn fc-btn-gain fc-btn-sm inline-flex mt-2"
                >
                  <Plus size={14} /> Cadastrar Primeira Meta
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {specificGoals.map((g) => {
                  const progressPct = pct(g.currentAmount, g.targetAmount);
                  const remaining = Math.max(0, g.targetAmount - g.currentAmount);

                  return (
                    <div
                      key={g.id}
                      className="fc-card"
                      style={{
                        borderTop: "4px solid var(--gain)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1.5" style={{ background: "var(--gain-bg)", color: "var(--gain)" }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gain)" }} />
                            OBJETIVO
                          </div>
                          <h3 className="text-base font-bold" style={{ color: "var(--text)" }}>{g.name}</h3>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Alocação segregada sem contaminação do fundo emergencial
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(g)}
                            className="fc-tx-action-btn"
                            title="Editar Meta"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteGoal(g.id)}
                            className="fc-tx-action-btn delete"
                            title="Excluir Meta"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Métricas */}
                      <div
                        className="p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 mb-3"
                        style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
                      >
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                            Acumulado
                          </span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xl font-black num-tabular" style={{ color: "var(--text)" }}>
                              {brl(g.currentAmount)}
                            </span>
                            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                              / {brl(g.targetAmount)}
                            </span>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                            Restante
                          </span>
                          <span className="text-sm font-bold num-tabular" style={{ color: "var(--expense)" }}>
                            {brl(remaining)}
                          </span>
                        </div>
                      </div>

                      {/* Barra de Progresso */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span style={{ color: "var(--text-muted)" }}>Progresso</span>
                          <span style={{ color: "var(--gain)" }}>{progressPct}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden p-0.5 border" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, progressPct)}%`,
                              background: "var(--gain)",
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs pt-0.5" style={{ color: "var(--text-muted)" }}>
                          <span>Aporte: <strong>{brl(g.monthlyContribution || 0)}/mês</strong></span>
                          <span>Prazo: <strong>{g.deadline ? g.deadline.split("-").reverse().join("/") : "Sem prazo"}</strong></span>
                        </div>
                      </div>

                      {/* Aporte Rápido */}
                      <div className="pt-2 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setContributeGoal(g);
                            setContribAmountStr("");
                          }}
                          className="fc-btn fc-btn-gain fc-btn-sm flex-1 font-bold"
                        >
                          <TrendingUp size={14} />
                          <span>+ Registrar Aporte</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Meta */}
      {isGoalModalOpen && (
        <GoalModal
          isOpen={isGoalModalOpen}
          initialData={editingGoal}
          onClose={handleCloseGoalModal}
          onSubmit={async (data) => {
            if (editingGoal && editingGoal.id) {
              await updateGoal(editingGoal.id, data);
            } else {
              await addGoal(data);
            }
          }}
        />
      )}

      {/* Modal Rápido de Aporte */}
      {contributeGoal && (
        <div className="fc-modal-overlay">
          <div className="fc-modal-sheet">
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} style={{ color: "var(--gain)" }} />
                <h3 className="font-bold text-sm" style={{ color: "var(--text)" }}>
                  Registrar Aporte: {contributeGoal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContributeGoal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickContribution} className="p-5 space-y-4">
              <div>
                <label className="fc-label">Valor do Aporte (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="0,00"
                  value={contribAmountStr}
                  onChange={(e) => setContribAmountStr(e.target.value)}
                  className="fc-input font-bold text-lg"
                  autoFocus
                />
              </div>

              <div className="p-3 rounded-lg border text-xs" style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text-muted)" }}>
                Este valor será somado diretamente ao saldo acumulado de <strong>{contributeGoal.name}</strong>.
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setContributeGoal(null)}
                  className="fc-btn fc-btn-secondary fc-btn-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="fc-btn fc-btn-gain fc-btn-sm font-bold"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Transação */}
      {isTxModalOpen && (
        <TransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          onSubmit={async (data) => {
            if (data.repeatMonths && data.repeatMonths > 1) {
              await addSeries(data, data.repeatMonths);
            } else {
              await addTransaction(data);
            }
          }}
        />
      )}
    </div>
  );
}
