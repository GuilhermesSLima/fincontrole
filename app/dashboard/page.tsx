"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { Navbar } from "@/components/Navbar";
import { TransactionModal } from "@/components/TransactionModal";
import { SeriesDeleteModal } from "@/components/SeriesDeleteModal";
import { Transaction, TransactionType } from "@/types";
import {
  brl,
  ym,
  shiftMonth,
  monthLabel,
  monthShort,
  getLast6Months,
  pct,
} from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  Search,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Visualização: 'month' | 'year' | 'custom'
  const [viewMode, setViewMode] = useState<"month" | "year" | "custom">("month");
  const [currentMonth, setCurrentMonth] = useState("2026-11");
  const [customStart, setCustomStart] = useState("2026-09-01");
  const [customEnd, setCustomEnd] = useState("2026-11-28");

  useEffect(() => {
    const today = new Date();
    const current = ym(today);
    setCurrentMonth(current);
    setCustomStart(shiftMonth(current, -2) + "-01");
    setCustomEnd(current + "-28");
  }, []);

  // Redirecionamento seguro no useEffect para evitar erro do React Router em render
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Filtros de Lançamento
  const [txFilter, setTxFilter] = useState<"all" | "in" | "out" | "pending" | "done">("all");
  const [search, setSearch] = useState("");

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>("out");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Hook de transações
  const {
    transactions,
    loading: txLoading,
    error: txError,
    addTransaction,
    addSeries,
    toggleDone,
    updateTransaction,
    deleteTransaction,
    deleteSeries,
    updateSeriesFuture,
    updateSeriesAll,
  } = useTransactions();

  // Filtragem dos dados de acordo com o período selecionado
  const periodTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (viewMode === "month") {
        return t.date.startsWith(currentMonth);
      }
      if (viewMode === "year") {
        const year = currentMonth.slice(0, 4);
        return t.date.startsWith(year);
      }
      if (viewMode === "custom") {
        return t.date >= customStart && t.date <= customEnd;
      }
      return true;
    });
  }, [transactions, viewMode, currentMonth, customStart, customEnd]);

  // Cálculos de Resumo
  const summary = useMemo(() => {
    let totalIn = 0;
    let realizedIn = 0;
    let totalOut = 0;
    let realizedOut = 0;

    periodTransactions.forEach((t) => {
      if (t.type === "in") {
        totalIn += t.amount;
        if (t.done) realizedIn += t.amount;
      } else {
        totalOut += t.amount;
        if (t.done) realizedOut += t.amount;
      }
    });

    return {
      totalIn,
      realizedIn,
      totalOut,
      realizedOut,
      estimatedBalance: totalIn - totalOut,
      realizedBalance: realizedIn - realizedOut,
    };
  }, [periodTransactions]);

  // Transações com filtro de tipo e busca aplicados
  const displayedTransactions = useMemo(() => {
    return periodTransactions
      .filter((t) => {
        if (txFilter === "in") return t.type === "in";
        if (txFilter === "out") return t.type === "out";
        if (txFilter === "pending") return !t.done;
        if (txFilter === "done") return t.done;
        return true;
      })
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return t.desc.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q);
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  }, [periodTransactions, txFilter, search]);

  // Dados para o Gráfico de Evolução dos Últimos 6 Meses
  const last6 = useMemo(() => {
    const months = getLast6Months(currentMonth);
    return months.map((m) => {
      const monthTx = transactions.filter((t) => t.date.startsWith(m));
      let mIn = 0;
      let mOut = 0;
      monthTx.forEach((t) => {
        if (t.type === "in") mIn += t.amount;
        else mOut += t.amount;
      });
      return { month: m, label: monthShort(m), in: mIn, out: mOut };
    });
  }, [transactions, currentMonth]);

  const maxValLast6 = useMemo(() => {
    return Math.max(1, ...last6.flatMap((d) => [d.in, d.out]));
  }, [last6]);

  // Dados para Distribuição por Categoria
  const categoryStats = useMemo(() => {
    const expenseTx = periodTransactions.filter((t) => t.type === "out");
    const map: Record<string, number> = {};
    expenseTx.forEach((t) => {
      map[t.cat] = (map[t.cat] || 0) + t.amount;
    });
    const total = summary.totalOut || 1;
    return Object.entries(map)
      .map(([cat, amount]) => ({
        cat,
        amount,
        pct: pct(amount, total),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodTransactions, summary.totalOut]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
          <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
            Carregando FinControle…
          </span>
        </div>
      </div>
    );
  }

  const handleOpenAdd = (type: TransactionType = "out") => {
    setEditingTx(null);
    setModalDefaultType(type);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setModalDefaultType(tx.type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTx(null);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar onOpenNewTx={handleOpenAdd} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Alerta de Permissão do Firestore se necessário */}
        {txError === "permission-denied" && (
          <div
            className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm"
            style={{
              background: "var(--pending-bg)",
              borderColor: "var(--pending-border)",
              color: "var(--pending)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">⚠️ Atenção:</span>
              <span>
                As regras de segurança do seu Cloud Firestore ainda precisam ser publicadas para salvar dados.
              </span>
            </div>
            <a
              href="https://console.firebase.google.com/project/fincontrole-23467/firestore/rules"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg font-bold text-white whitespace-nowrap shadow-sm hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              Publicar Regras no Firebase
            </a>
          </div>
        )}

        {/* Barra Superior: Modo de Período e Seletor de Data */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {/* Seletor de Modo: Mensal / Anual / Custom */}
          <div
            className="flex items-center p-1 rounded-xl border text-xs font-semibold w-full sm:w-auto"
            style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
          >
            <button
              onClick={() => setViewMode("month")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                viewMode === "month" ? "font-bold shadow-sm" : "opacity-60 hover:opacity-100"
              }`}
              style={{
                background: viewMode === "month" ? "var(--surface)" : "transparent",
                color: "var(--text)",
              }}
            >
              Mensal
            </button>
            <button
              onClick={() => setViewMode("year")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                viewMode === "year" ? "font-bold shadow-sm" : "opacity-60 hover:opacity-100"
              }`}
              style={{
                background: viewMode === "year" ? "var(--surface)" : "transparent",
                color: "var(--text)",
              }}
            >
              Anual ({currentMonth.slice(0, 4)})
            </button>
            <button
              onClick={() => setViewMode("custom")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
                viewMode === "custom" ? "font-bold shadow-sm" : "opacity-60 hover:opacity-100"
              }`}
              style={{
                background: viewMode === "custom" ? "var(--surface)" : "transparent",
                color: "var(--text)",
              }}
            >
              Customizado
            </button>
          </div>

          {/* Navegador de Data */}
          {viewMode === "month" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentMonth(shiftMonth(currentMonth, -1))}
                className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:opacity-80 active:scale-95 shadow-sm"
                style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--subtle)" }}
                title="Mês anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-extrabold text-sm sm:text-base min-w-[160px] text-center capitalize tracking-tight">
                {monthLabel(currentMonth)}
              </span>
              <button
                onClick={() => setCurrentMonth(shiftMonth(currentMonth, 1))}
                className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:opacity-80 active:scale-95 shadow-sm"
                style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--subtle)" }}
                title="Próximo mês"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {viewMode === "year" && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentMonth(shiftMonth(currentMonth, -12))}
                className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:opacity-80 shadow-sm"
                style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--subtle)" }}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-extrabold text-base tracking-tight">{currentMonth.slice(0, 4)}</span>
              <button
                onClick={() => setCurrentMonth(shiftMonth(currentMonth, 12))}
                className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:opacity-80 shadow-sm"
                style={{ borderColor: "var(--border)", color: "var(--text)", background: "var(--subtle)" }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {viewMode === "custom" && (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-lg border outline-none"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
              <span>até</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-lg border outline-none"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          )}
        </div>

        {/* 3 Cards de Resumo: Ganhos, Gastos, Saldo com Botões Dedicados */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card: Ganhos Previstos */}
          <div
            className="rounded-2xl p-6 border shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: "var(--gain)" }} />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-extrabold tracking-wider" style={{ color: "var(--muted)" }}>
                  Ganhos Previstos
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--gain-bg)", color: "var(--gain)" }}
                >
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="text-3xl font-black tabular tracking-tight" style={{ color: "var(--gain)" }}>
                {brl(summary.totalIn)}
              </div>
              <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <span style={{ color: "var(--muted)" }}>Já recebido:</span>
                <strong className="tabular font-bold" style={{ color: "var(--text)" }}>
                  {brl(summary.realizedIn)}
                </strong>
              </div>
            </div>

            {/* Botão Dedicado + Adicionar Ganho */}
            <button
              type="button"
              onClick={() => handleOpenAdd("in")}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-98 shadow-sm"
              style={{ background: "var(--gain)" }}
            >
              <Plus size={15} />
              <span>Adicionar Ganho</span>
            </button>
          </div>

          {/* Card: Gastos Previstos */}
          <div
            className="rounded-2xl p-6 border shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: "var(--expense)" }} />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-extrabold tracking-wider" style={{ color: "var(--muted)" }}>
                  Gastos Previstos
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--expense-bg)", color: "var(--expense)" }}
                >
                  <TrendingDown size={16} />
                </div>
              </div>
              <div className="text-3xl font-black tabular tracking-tight" style={{ color: "var(--expense)" }}>
                {brl(summary.totalOut)}
              </div>
              <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <span style={{ color: "var(--muted)" }}>Já pago:</span>
                <strong className="tabular font-bold" style={{ color: "var(--text)" }}>
                  {brl(summary.realizedOut)}
                </strong>
              </div>
            </div>

            {/* Botão Dedicado + Adicionar Gasto */}
            <button
              type="button"
              onClick={() => handleOpenAdd("out")}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-98 shadow-sm"
              style={{ background: "var(--expense)" }}
            >
              <Plus size={15} />
              <span>Adicionar Gasto</span>
            </button>
          </div>

          {/* Card: Saldo Livre Estimado */}
          <div
            className="rounded-2xl p-6 border shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="absolute top-0 left-0 w-full h-1.5" style={{ background: "var(--accent)" }} />
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-extrabold tracking-wider" style={{ color: "var(--muted)" }}>
                  Saldo Livre Estimado
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                >
                  <Wallet size={16} />
                </div>
              </div>
              <div
                className={`text-3xl font-black tabular tracking-tight ${
                  summary.estimatedBalance >= 0 ? "" : "text-red-500"
                }`}
                style={{ color: summary.estimatedBalance >= 0 ? "var(--accent)" : undefined }}
              >
                {brl(summary.estimatedBalance)}
              </div>
              <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <span style={{ color: "var(--muted)" }}>Realizado hoje em conta:</span>
                <strong
                  className="tabular font-bold"
                  style={{ color: summary.realizedBalance >= 0 ? "var(--gain)" : "var(--expense)" }}
                >
                  {brl(summary.realizedBalance)}
                </strong>
              </div>
            </div>

            {/* Atalho de Navegação para Metas */}
            <button
              type="button"
              onClick={() => router.push("/metas")}
              className="w-full py-2.5 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all hover:opacity-85 shadow-sm"
              style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              <span>Ver Metas e Reservas →</span>
            </button>
          </div>
        </section>

        {/* Lançamentos do Período */}
        <section
          className="rounded-2xl p-6 border shadow-sm space-y-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Lançamentos do Período</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                Alterne entre Previsto e Realizado com apenas 1 clique sobre o badge de status
              </p>
            </div>

            {/* Botões Rápidos de Ganho e Gasto */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleOpenAdd("in")}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 shadow-sm"
                style={{ background: "var(--gain)" }}
              >
                <Plus size={14} />
                <span>+ Ganho</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAdd("out")}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90 shadow-sm"
                style={{ background: "var(--expense)" }}
              >
                <Plus size={14} />
                <span>+ Gasto</span>
              </button>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { id: "all", label: "Todos" },
                { id: "in", label: "Ganhos (+)" },
                { id: "out", label: "Gastos (−)" },
                { id: "pending", label: "Previstos" },
                { id: "done", label: "Realizados" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTxFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                    txFilter === f.id ? "shadow-sm" : "hover:opacity-80"
                  }`}
                  style={{
                    background: txFilter === f.id ? "var(--accent)" : "var(--subtle)",
                    color: txFilter === f.id ? "#ffffff" : "var(--muted)",
                    borderColor: txFilter === f.id ? "var(--accent)" : "var(--border)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Buscar lançamento ou categoria…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border outline-none font-medium"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          </div>

          {/* Lista de Transações */}
          {displayedTransactions.length === 0 ? (
            <div
              className="text-center py-12 rounded-2xl border space-y-4"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <div className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                Nenhum lançamento registrado neste período.
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenAdd("in")}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm hover:opacity-90"
                  style={{ background: "var(--gain)" }}
                >
                  + Adicionar Primeiro Ganho
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAdd("out")}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm hover:opacity-90"
                  style={{ background: "var(--expense)" }}
                >
                  + Adicionar Primeiro Gasto
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              {displayedTransactions.map((tx) => {
                const isGain = tx.type === "in";
                const dateParts = tx.date.split("-");
                const formattedDate = `${dateParts[2]}/${dateParts[1]}`;

                return (
                  <div
                    key={tx.id}
                    className="p-4 flex items-center justify-between gap-4 group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                  >
                    {/* Lado Esquerdo: Ícone + Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-none border shadow-xs"
                        style={{
                          background: isGain ? "var(--gain-bg)" : "var(--expense-bg)",
                          color: isGain ? "var(--gain)" : "var(--expense)",
                          borderColor: isGain ? "var(--gain-border)" : "var(--expense-border)",
                        }}
                      >
                        {isGain ? "+" : "−"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-bold text-sm truncate">
                          <span>{tx.desc}</span>
                          {tx.seriesId && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border"
                              style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--accent)" }}
                              title={`Parcela ${tx.seriesIndex} de ${tx.seriesTotal}`}
                            >
                              <Layers size={10} />
                              {tx.seriesIndex}/{tx.seriesTotal}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                          <span>{tx.cat}</span>
                          <span>•</span>
                          <span>{formattedDate}</span>
                          <span>•</span>
                          {/* Badge interativo de Previsto/Realizado */}
                          <button
                            type="button"
                            onClick={() => toggleDone(tx.id, !tx.done)}
                            title="Clique para alternar Previsto / Realizado"
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-transform active:scale-95 cursor-pointer shadow-2xs"
                            style={{
                              background: tx.done ? "var(--gain-bg)" : "var(--pending-bg)",
                              color: tx.done ? "var(--gain)" : "var(--pending)",
                              borderColor: tx.done ? "var(--gain-border)" : "var(--pending-border)",
                            }}
                          >
                            {tx.done ? (isGain ? "recebido" : "pago") : "previsto"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Valor + Ações */}
                    <div className="flex items-center gap-3.5 flex-none">
                      <span
                        className="font-extrabold text-base tabular tracking-tight"
                        style={{ color: isGain ? "var(--gain)" : "var(--expense)" }}
                      >
                        {isGain ? "+ " : "− "}
                        {brl(tx.amount)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(tx)}
                          title="Editar lançamento"
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          style={{ color: "var(--muted)" }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTx(tx)}
                          title="Excluir lançamento"
                          className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 transition-colors"
                          style={{ color: "var(--muted)" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Dashboard com Gráficos: Evolução 6 Meses e Categorias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução dos Últimos 6 Meses */}
          <div
            className="rounded-2xl p-6 border shadow-sm space-y-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div>
              <h3 className="text-base font-bold tracking-tight">Evolução dos Últimos 6 Meses</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Comparativo mensal de ganhos vs. gastos</p>
            </div>

            <div className="flex items-end justify-between h-44 pt-6 pb-2 border-b gap-3" style={{ borderColor: "var(--border)" }}>
              {last6.map((d) => {
                const inHeight = Math.max(4, Math.round((d.in / maxValLast6) * 120));
                const outHeight = Math.max(4, Math.round((d.out / maxValLast6) * 120));

                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end">
                    <div className="flex items-end gap-1.5 h-[120px]">
                      <div
                        className="w-3.5 rounded-t-sm transition-all"
                        style={{ height: `${inHeight}px`, background: "var(--gain)" }}
                        title={`Ganhos ${d.label}: ${brl(d.in)}`}
                      />
                      <div
                        className="w-3.5 rounded-t-sm transition-all"
                        style={{ height: `${outHeight}px`, background: "var(--expense)" }}
                        title={`Gastos ${d.label}: ${brl(d.out)}`}
                      />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-6 text-xs font-semibold" style={{ color: "var(--muted)" }}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: "var(--gain)" }} />
                <span>Ganhos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: "var(--expense)" }} />
                <span>Gastos</span>
              </div>
            </div>
          </div>

          {/* Gastos por Categoria */}
          <div
            className="rounded-2xl p-6 border shadow-sm space-y-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div>
              <h3 className="text-base font-bold tracking-tight">Gastos por Categoria</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Distribuição proporcional das despesas do período</p>
            </div>

            {categoryStats.length === 0 ? (
              <div className="text-center py-12 text-xs font-medium" style={{ color: "var(--muted)" }}>
                Nenhum gasto registrado neste período.
              </div>
            ) : (
              <div className="space-y-3.5">
                {categoryStats.map((item) => (
                  <div key={item.cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{item.cat}</span>
                      <span className="tabular">
                        {brl(item.amount)} ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--subtle)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.pct}%`, background: "var(--expense)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabela Analítica de Acompanhamento */}
        <section
          className="rounded-2xl p-6 border shadow-sm space-y-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div>
            <h3 className="text-base font-bold tracking-tight">Tabela Analítica de Movimentações</h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Visão contábil detalhada de todas as entradas e saídas</p>
          </div>

          <div className="w-full overflow-x-auto border rounded-xl" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-left text-xs">
              <thead className="uppercase tracking-wider border-b" style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--muted)" }}>
                <tr>
                  <th className="py-3 px-4 font-bold">Data</th>
                  <th className="py-3 px-4 font-bold">Descrição</th>
                  <th className="py-3 px-4 font-bold">Categoria</th>
                  <th className="py-3 px-4 font-bold">Tipo</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {displayedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs font-medium" style={{ color: "var(--muted)" }}>
                      Sem movimentações registradas neste período.
                    </td>
                  </tr>
                ) : (
                  displayedTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4 tabular font-mono">{t.date}</td>
                      <td className="py-3 px-4 font-bold">{t.desc}</td>
                      <td className="py-3 px-4 font-medium">{t.cat}</td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: t.type === "in" ? "var(--gain-bg)" : "var(--expense-bg)",
                            color: t.type === "in" ? "var(--gain)" : "var(--expense)",
                          }}
                        >
                          {t.type === "in" ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: t.done ? "var(--gain-bg)" : "var(--pending-bg)",
                            color: t.done ? "var(--gain)" : "var(--pending)",
                          }}
                        >
                          {t.done ? (t.type === "in" ? "Recebido" : "Pago") : "Previsto"}
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-right font-extrabold tabular text-sm"
                        style={{ color: t.type === "in" ? "var(--gain)" : "var(--expense)" }}
                      >
                        {t.type === "in" ? "+ " : "− "}
                        {brl(t.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modais */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSaveSingle={addTransaction}
        onSaveSeries={addSeries}
        onUpdateSingle={updateTransaction}
        onUpdateSeriesFuture={updateSeriesFuture}
        onUpdateSeriesAll={updateSeriesAll}
        initialData={editingTx}
        defaultType={modalDefaultType}
      />

      <SeriesDeleteModal
        isOpen={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        tx={deletingTx}
        onDeleteSingle={deleteTransaction}
        onDeleteSeries={deleteSeries}
      />
    </div>
  );
}
