"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { Navbar } from "@/components/Navbar";
import { TransactionModal } from "@/components/TransactionModal";
import { SeriesDeleteModal } from "@/components/SeriesDeleteModal";
import { Transaction } from "@/types";
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

  // Filtros de Lançamento
  const [txFilter, setTxFilter] = useState<"all" | "in" | "out" | "pending" | "done">("all");
  const [search, setSearch] = useState("");

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Hook de transações
  const {
    transactions,
    loading: txLoading,
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

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTx(null);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar onOpenNewTx={() => { setEditingTx(null); setIsModalOpen(true); }} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Barra Superior: Modo de Período e Seletor de Mês */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          {/* Seletor de Modo: Mensal / Anual / Custom */}
          <div
            className="flex items-center p-1 rounded-lg border text-xs font-medium"
            style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
          >
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 rounded-md transition-all ${
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
              className={`px-3 py-1.5 rounded-md transition-all ${
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
              className={`px-3 py-1.5 rounded-md transition-all ${
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(shiftMonth(currentMonth, -1))}
                className="w-8 h-8 rounded-md border flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
                title="Mês anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-bold text-sm min-w-[140px] text-center capitalize">
                {monthLabel(currentMonth)}
              </span>
              <button
                onClick={() => setCurrentMonth(shiftMonth(currentMonth, 1))}
                className="w-8 h-8 rounded-md border flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
                title="Próximo mês"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {viewMode === "year" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(shiftMonth(currentMonth, -12))}
                className="w-8 h-8 rounded-md border flex items-center justify-center"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-bold text-sm">{currentMonth.slice(0, 4)}</span>
              <button
                onClick={() => setCurrentMonth(shiftMonth(currentMonth, 12))}
                className="w-8 h-8 rounded-md border flex items-center justify-center"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {viewMode === "custom" && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2 py-1 rounded border"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
              <span>até</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2 py-1 rounded border"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          )}
        </div>

        {/* 3 Cards de Resumo: Ganhos, Gastos, Saldo */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ganhos */}
          <div
            className="rounded-xl p-5 border shadow-sm relative overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: "var(--gain)" }} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>
                Ganhos Previstos
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--gain-bg)", color: "var(--gain)" }}
              >
                <TrendingUp size={15} />
              </div>
            </div>
            <div className="text-2xl font-black tabular" style={{ color: "var(--gain)" }}>
              {brl(summary.totalIn)}
            </div>
            <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Já recebido:</span>
              <strong className="tabular font-semibold" style={{ color: "var(--text)" }}>
                {brl(summary.realizedIn)}
              </strong>
            </div>
          </div>

          {/* Gastos */}
          <div
            className="rounded-xl p-5 border shadow-sm relative overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: "var(--expense)" }} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>
                Gastos Previstos
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--expense-bg)", color: "var(--expense)" }}
              >
                <TrendingDown size={15} />
              </div>
            </div>
            <div className="text-2xl font-black tabular" style={{ color: "var(--expense)" }}>
              {brl(summary.totalOut)}
            </div>
            <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Já pago:</span>
              <strong className="tabular font-semibold" style={{ color: "var(--text)" }}>
                {brl(summary.realizedOut)}
              </strong>
            </div>
          </div>

          {/* Saldo Livre */}
          <div
            className="rounded-xl p-5 border shadow-sm relative overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: "var(--accent)" }} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>
                Saldo Livre Estimado
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
              >
                <Wallet size={15} />
              </div>
            </div>
            <div
              className={`text-2xl font-black tabular ${
                summary.estimatedBalance >= 0 ? "" : "text-red-500"
              }`}
              style={{ color: summary.estimatedBalance >= 0 ? "var(--accent)" : undefined }}
            >
              {brl(summary.estimatedBalance)}
            </div>
            <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted)" }}>Saldo Realizado hoje:</span>
              <strong
                className="tabular font-semibold"
                style={{ color: summary.realizedBalance >= 0 ? "var(--gain)" : "var(--expense)" }}
              >
                {brl(summary.realizedBalance)}
              </strong>
            </div>
          </div>
        </section>

        {/* Lançamentos do Período */}
        <section
          className="rounded-xl p-5 border shadow-sm space-y-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold tracking-tight">Lançamentos do Período</h2>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Clique no badge do status para alternar entre Previsto e Realizado em 1 clique
              </p>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
              {displayedTransactions.length} {displayedTransactions.length === 1 ? "item" : "itens"}
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
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
                  className={`px-3 py-1 rounded-full border font-medium transition-all ${
                    txFilter === f.id ? "font-bold shadow-sm" : "hover:opacity-80"
                  }`}
                  style={{
                    background: txFilter === f.id ? "var(--text)" : "var(--surface)",
                    color: txFilter === f.id ? "var(--surface)" : "var(--muted)",
                    borderColor: txFilter === f.id ? "var(--text)" : "var(--border)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar lançamento…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-48 px-3 py-1 text-xs rounded-full border outline-none"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          </div>

          {/* Lista de Transações */}
          {displayedTransactions.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: "var(--muted)" }}>
              Nenhum lançamento encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {displayedTransactions.map((tx) => {
                const isGain = tx.type === "in";
                const dateParts = tx.date.split("-");
                const formattedDate = `${dateParts[2]}/${dateParts[1]}`;

                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-3 group transition-colors"
                  >
                    {/* Lado Esquerdo: Ícone + Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-none border"
                        style={{
                          background: isGain ? "var(--gain-bg)" : "var(--expense-bg)",
                          color: isGain ? "var(--gain)" : "var(--expense)",
                          borderColor: isGain ? "var(--gain-border)" : "var(--expense-border)",
                        }}
                      >
                        {isGain ? "+" : "−"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-semibold text-sm truncate">
                          <span>{tx.desc}</span>
                          {tx.seriesId && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 border"
                              style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--accent)" }}
                              title={`Parcela ${tx.seriesIndex} de ${tx.seriesTotal}`}
                            >
                              <Layers size={10} />
                              {tx.seriesIndex}/{tx.seriesTotal}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                          <span>{tx.cat}</span>
                          <span>•</span>
                          <span>{formattedDate}</span>
                          <span>•</span>
                          {/* Badge interativo de Previsto/Realizado */}
                          <button
                            type="button"
                            onClick={() => toggleDone(tx.id, !tx.done)}
                            title="Clique para alternar Previsto / Realizado"
                            className="px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-transform active:scale-95 cursor-pointer"
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
                    <div className="flex items-center gap-3 flex-none">
                      <span
                        className="font-bold text-sm tabular"
                        style={{ color: isGain ? "var(--gain)" : "var(--expense)" }}
                      >
                        {isGain ? "+ " : "− "}
                        {brl(tx.amount)}
                      </span>
                      <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(tx)}
                          title="Editar lançamento"
                          className="p-1.5 rounded-md hover:opacity-80"
                          style={{ color: "var(--muted)" }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTx(tx)}
                          title="Excluir lançamento"
                          className="p-1.5 rounded-md hover:text-red-500"
                          style={{ color: "var(--muted)" }}
                        >
                          <Trash2 size={14} />
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
            className="rounded-xl p-5 border shadow-sm space-y-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div>
              <h3 className="text-sm font-bold">Evolução dos Últimos 6 Meses</h3>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Comparativo mensal de ganhos vs. gastos</p>
            </div>

            <div className="flex items-end justify-between h-40 pt-6 pb-2 border-b gap-3" style={{ borderColor: "var(--border)" }}>
              {last6.map((d) => {
                const inHeight = Math.max(3, Math.round((d.in / maxValLast6) * 110));
                const outHeight = Math.max(3, Math.round((d.out / maxValLast6) * 110));

                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="flex items-end gap-1.5 h-[110px]">
                      <div
                        className="w-3 rounded-t transition-all"
                        style={{ height: `${inHeight}px`, background: "var(--gain)" }}
                        title={`Ganhos ${d.label}: ${brl(d.in)}`}
                      />
                      <div
                        className="w-3 rounded-t transition-all"
                        style={{ height: `${outHeight}px`, background: "var(--expense)" }}
                        title={`Gastos ${d.label}: ${brl(d.out)}`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold uppercase" style={{ color: "var(--muted)" }}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-6 text-xs" style={{ color: "var(--muted)" }}>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--gain)" }} />
                <span>Ganhos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--expense)" }} />
                <span>Gastos</span>
              </div>
            </div>
          </div>

          {/* Gastos por Categoria */}
          <div
            className="rounded-xl p-5 border shadow-sm space-y-4"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div>
              <h3 className="text-sm font-bold">Gastos por Categoria</h3>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Distribuição proporcional das despesas do período</p>
            </div>

            {categoryStats.length === 0 ? (
              <div className="text-center py-10 text-xs" style={{ color: "var(--muted)" }}>
                Nenhum gasto registrado neste período.
              </div>
            ) : (
              <div className="space-y-3">
                {categoryStats.map((item) => (
                  <div key={item.cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>{item.cat}</span>
                      <span className="tabular font-semibold">
                        {brl(item.amount)} ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--subtle)" }}>
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

        {/* Tabela Analítica de Acompanhamento (Requisito 6 - Tabela ou Gráfico com acompanhamento detalhado) */}
        <section
          className="rounded-xl p-5 border shadow-sm space-y-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">Tabela Analítica de Movimentações</h3>
              <p className="text-xs" style={{ color: "var(--muted)" }}>Visão contábil detalhada de todas as entradas e saídas</p>
            </div>
          </div>

          <div className="w-full overflow-x-auto border rounded-lg" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-left text-xs">
              <thead className="uppercase tracking-wider border-b" style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--muted)" }}>
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Data</th>
                  <th className="py-2.5 px-4 font-semibold">Descrição</th>
                  <th className="py-2.5 px-4 font-semibold">Categoria</th>
                  <th className="py-2.5 px-4 font-semibold">Tipo</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {displayedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs" style={{ color: "var(--muted)" }}>
                      Sem movimentações registradas.
                    </td>
                  </tr>
                ) : (
                  displayedTransactions.map((t) => (
                    <tr key={t.id} className="hover:opacity-85 transition-opacity">
                      <td className="py-2.5 px-4 tabular font-mono">{t.date}</td>
                      <td className="py-2.5 px-4 font-semibold">{t.desc}</td>
                      <td className="py-2.5 px-4">{t.cat}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            background: t.type === "in" ? "var(--gain-bg)" : "var(--expense-bg)",
                            color: t.type === "in" ? "var(--gain)" : "var(--expense)",
                          }}
                        >
                          {t.type === "in" ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            background: t.done ? "var(--gain-bg)" : "var(--pending-bg)",
                            color: t.done ? "var(--gain)" : "var(--pending)",
                          }}
                        >
                          {t.done ? (t.type === "in" ? "Recebido" : "Pago") : "Previsto"}
                        </span>
                      </td>
                      <td
                        className="py-2.5 px-4 text-right font-bold tabular"
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
