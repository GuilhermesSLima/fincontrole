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
  Search,
  Calendar,
  Layers,
  ArrowUpDown,
  Filter,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Modo de visualização: 'month' | 'year' | 'custom'
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

  // Redirecionamento seguro pós-render
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // Filtros
  const [txFilter, setTxFilter] = useState<"all" | "in" | "out" | "pending" | "done">("all");
  const [search, setSearch] = useState("");

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>("out");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  // Hook Firestore de transações
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

  // Filtro de transações pelo período
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

  // Transações filtradas por status/tipo e texto de busca
  const filteredTransactions = useMemo(() => {
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
        return (
          t.desc.toLowerCase().includes(q) ||
          t.cat.toLowerCase().includes(q) ||
          t.date.includes(q)
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [periodTransactions, txFilter, search]);

  // Cálculo rigoroso dos resumos financeiros
  const summary = useMemo(() => {
    let totalIn = 0;
    let realIn = 0;
    let totalOut = 0;
    let realOut = 0;

    periodTransactions.forEach((t) => {
      if (t.type === "in") {
        totalIn += t.amount;
        if (t.done) realIn += t.amount;
      } else {
        totalOut += t.amount;
        if (t.done) realOut += t.amount;
      }
    });

    const estimatedBalance = totalIn - totalOut;
    const realBalance = realIn - realOut;

    return {
      totalIn,
      realIn,
      totalOut,
      realOut,
      estimatedBalance,
      realBalance,
    };
  }, [periodTransactions]);

  // Comparativo dos últimos 6 meses para o gráfico
  const last6Data = useMemo(() => {
    const months = getLast6Months(currentMonth);
    const maxVal = Math.max(
      1,
      ...months.map((m) => {
        const inM = transactions
          .filter((t) => t.type === "in" && t.date.startsWith(m))
          .reduce((acc, c) => acc + c.amount, 0);
        const outM = transactions
          .filter((t) => t.type === "out" && t.date.startsWith(m))
          .reduce((acc, c) => acc + c.amount, 0);
        return Math.max(inM, outM);
      })
    );

    return months.map((m) => {
      const inVal = transactions
        .filter((t) => t.type === "in" && t.date.startsWith(m))
        .reduce((acc, c) => acc + c.amount, 0);
      const outVal = transactions
        .filter((t) => t.type === "out" && t.date.startsWith(m))
        .reduce((acc, c) => acc + c.amount, 0);

      const inHeight = Math.max(4, Math.round((inVal / maxVal) * 110));
      const outHeight = Math.max(4, Math.round((outVal / maxVal) * 110));

      return {
        month: m,
        label: monthShort(m),
        inVal,
        outVal,
        inHeight,
        outHeight,
      };
    });
  }, [transactions, currentMonth]);

  // Distribuição de gastos por categoria
  const catDistribution = useMemo(() => {
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
          <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
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

      <main className="fc-container">
        {/* Alerta de Configuração de Regras do Firestore se necessário */}
        {txError === "permission-denied" && (
          <div className="fc-golden-rule-banner" style={{ background: "var(--pending-bg)", borderColor: "var(--pending-border)", color: "var(--pending-text)" }}>
            <span className="text-base font-bold">⚠️ Atenção:</span>
            <div className="flex-1 text-xs">
              As regras de segurança do seu Cloud Firestore ainda precisam ser publicadas para salvar seus lançamentos em nuvem.
            </div>
            <a
              href="https://console.firebase.google.com/project/fincontrole-23467/firestore/rules"
              target="_blank"
              rel="noreferrer"
              className="fc-btn fc-btn-primary fc-btn-sm"
            >
              Publicar Regras no Firebase
            </a>
          </div>
        )}

        {/* Barra de Período e Navegação de Data */}
        <section className="fc-period-bar">
          {/* Seletor de Modo: Mensal / Anual / Customizado */}
          <div className="fc-segmented-control">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`fc-segmented-btn ${viewMode === "month" ? "active" : ""}`}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setViewMode("year")}
              className={`fc-segmented-btn ${viewMode === "year" ? "active" : ""}`}
            >
              Anual ({currentMonth.slice(0, 4)})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("custom")}
              className={`fc-segmented-btn ${viewMode === "custom" ? "active" : ""}`}
            >
              Customizado
            </button>
          </div>

          {/* Navegador Mensal */}
          {viewMode === "month" && (
            <div className="fc-month-nav">
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => shiftMonth(prev, -1))}
                className="fc-month-nav-btn"
                title="Mês anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="fc-month-nav-title">{monthLabel(currentMonth)}</span>
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => shiftMonth(prev, 1))}
                className="fc-month-nav-btn"
                title="Próximo mês"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Navegador Anual */}
          {viewMode === "year" && (
            <div className="fc-month-nav">
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => shiftMonth(prev, -12))}
                className="fc-month-nav-btn"
                title="Ano anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="fc-month-nav-title">Ano de {currentMonth.slice(0, 4)}</span>
              <button
                type="button"
                onClick={() => setCurrentMonth((prev) => shiftMonth(prev, 12))}
                className="fc-month-nav-btn"
                title="Próximo ano"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Navegador Customizado */}
          {viewMode === "custom" && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="fc-input"
                style={{ padding: "6px 10px", width: "auto" }}
              />
              <span style={{ color: "var(--text-muted)" }}>até</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="fc-input"
                style={{ padding: "6px 10px", width: "auto" }}
              />
            </div>
          )}
        </section>

        {/* 3 CARDS DE RESUMO (GANHOS, GASTOS, SALDO LIVRE) */}
        <section className="fc-metrics-grid">
          {/* Card Ganhos */}
          <div className="fc-metric-card fc-metric-gain">
            <div className="fc-metric-header">
              <span className="fc-metric-caption">Ganhos do Período</span>
              <div className="fc-metric-icon-wrap">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="fc-metric-val num-tabular">{brl(summary.totalIn)}</div>
            <div className="fc-metric-footer">
              <span>Realizado recebido:</span>
              <strong className="num-tabular" style={{ color: "var(--gain)" }}>
                {brl(summary.realIn)}
              </strong>
            </div>
          </div>

          {/* Card Gastos */}
          <div className="fc-metric-card fc-metric-expense">
            <div className="fc-metric-header">
              <span className="fc-metric-caption">Gastos do Período</span>
              <div className="fc-metric-icon-wrap">
                <TrendingDown size={18} />
              </div>
            </div>
            <div className="fc-metric-val num-tabular">{brl(summary.totalOut)}</div>
            <div className="fc-metric-footer">
              <span>Realizado pago:</span>
              <strong className="num-tabular" style={{ color: "var(--expense)" }}>
                {brl(summary.realOut)}
              </strong>
            </div>
          </div>

          {/* Card Saldo Livre */}
          <div className="fc-metric-card fc-metric-balance">
            <div className="fc-metric-header">
              <span className="fc-metric-caption">Saldo Livre Estimado</span>
              <div className="fc-metric-icon-wrap">
                <Wallet size={18} />
              </div>
            </div>
            <div className="fc-metric-val num-tabular">{brl(summary.estimatedBalance)}</div>
            <div className="fc-metric-footer">
              <span>Saldo em conta hoje:</span>
              <strong className="num-tabular" style={{ color: "var(--accent)" }}>
                {brl(summary.realBalance)}
              </strong>
            </div>
          </div>
        </section>

        {/* LANÇAMENTOS DO PERÍODO */}
        <section className="fc-card" style={{ marginBottom: 24 }}>
          <div className="fc-card-header">
            <div>
              <h2 className="fc-card-title">
                <Layers size={18} style={{ color: "var(--accent)" }} />
                <span>Lançamentos do Período</span>
              </h2>
              <p className="fc-card-subtitle">
                Clique no status para alternar entre Previsto e Realizado em 1 clique
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="fc-badge fc-badge-accent">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? "item" : "itens"}
              </span>
              <button
                type="button"
                onClick={() => handleOpenAdd("in")}
                className="fc-btn fc-btn-gain fc-btn-sm"
              >
                <Plus size={14} />
                <span>+ Ganho</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAdd("out")}
                className="fc-btn fc-btn-expense fc-btn-sm"
              >
                <Plus size={14} />
                <span>+ Gasto</span>
              </button>
            </div>
          </div>

          {/* Barra de Filtros e Busca */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="fc-filter-group">
              <button
                type="button"
                onClick={() => setTxFilter("all")}
                className={`fc-filter-pill ${txFilter === "all" ? "active" : ""}`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setTxFilter("in")}
                className={`fc-filter-pill ${txFilter === "in" ? "active" : ""}`}
              >
                Ganhos (+)
              </button>
              <button
                type="button"
                onClick={() => setTxFilter("out")}
                className={`fc-filter-pill ${txFilter === "out" ? "active" : ""}`}
              >
                Gastos (−)
              </button>
              <button
                type="button"
                onClick={() => setTxFilter("pending")}
                className={`fc-filter-pill ${txFilter === "pending" ? "active" : ""}`}
              >
                Previstos
              </button>
              <button
                type="button"
                onClick={() => setTxFilter("done")}
                className={`fc-filter-pill ${txFilter === "done" ? "active" : ""}`}
              >
                Realizados
              </button>
            </div>

            {/* Input de Busca */}
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Buscar descrição ou categoria…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="fc-input"
                style={{ paddingLeft: 32, paddingTop: 6, paddingBottom: 6, fontSize: "0.82rem" }}
              />
            </div>
          </div>

          {/* Lista de Transações */}
          {filteredTransactions.length === 0 ? (
            <div
              className="p-10 text-center rounded-xl border border-dashed flex flex-col items-center justify-center gap-3"
              style={{ borderColor: "var(--border)", background: "var(--subtle)" }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "var(--surface)", color: "var(--text-muted)" }}
              >
                <Search size={22} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                  Nenhum lançamento encontrado
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {search
                    ? "Tente buscar por outro termo ou limpar os filtros."
                    : "Cadastre seu primeiro ganho ou gasto para começar a gerenciar suas finanças."}
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleOpenAdd("in")}
                  className="fc-btn fc-btn-gain fc-btn-sm"
                >
                  <Plus size={14} /> + Cadastrar Ganho
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAdd("out")}
                  className="fc-btn fc-btn-expense fc-btn-sm"
                >
                  <Plus size={14} /> + Cadastrar Gasto
                </button>
              </div>
            </div>
          ) : (
            <div className="fc-tx-list">
              {filteredTransactions.map((tx) => {
                const isGain = tx.type === "in";
                return (
                  <div key={tx.id} className="fc-tx-item">
                    <div className="fc-tx-left">
                      <div className={`fc-tx-icon-badge ${isGain ? "gain" : "expense"}`}>
                        {isGain ? "+" : "−"}
                      </div>
                      <div className="fc-tx-info">
                        <span className="fc-tx-title">{tx.desc}</span>
                        <div className="fc-tx-meta">
                          <span className="fc-tx-cat-pill">{tx.cat}</span>
                          <span>{tx.date.split("-").reverse().join("/")}</span>
                          {tx.seriesId && (
                            <span
                              className="px-2 py-0.5 rounded text-[11px] font-bold"
                              style={{ background: "var(--accent-bg)", color: "var(--accent-text)" }}
                            >
                              Parcela {tx.seriesIndex}/{tx.seriesTotal}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="fc-tx-right">
                      <div className="fc-tx-value-block">
                        <span className={`fc-tx-amount num-tabular ${isGain ? "gain" : "expense"}`}>
                          {isGain ? "+" : "−"} {brl(tx.amount)}
                        </span>

                        {/* Badge de Status Interativo (Alterna com 1 clique) */}
                        <button
                          type="button"
                          onClick={() => toggleDone(tx.id, !tx.done)}
                          className={`fc-badge fc-badge-interactive ${
                            tx.done ? "fc-badge-gain" : "fc-badge-pending"
                          }`}
                          title="Clique para alternar entre Previsto e Realizado"
                        >
                          {tx.done ? (
                            <>
                              <CheckCircle2 size={11} />
                              <span>{isGain ? "Recebido" : "Pago"}</span>
                            </>
                          ) : (
                            <>
                              <Clock size={11} />
                              <span>Previsto</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="fc-tx-actions">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(tx)}
                          className="fc-tx-action-btn"
                          title="Editar lançamento"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTx(tx)}
                          className="fc-tx-action-btn delete"
                          title="Excluir lançamento"
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

        {/* ANÁLISE COMPARATIVA & DISTRIBUIÇÃO */}
        <section className="fc-analytics-grid">
          {/* Histórico dos Últimos 6 Meses */}
          <div className="fc-card">
            <div className="fc-card-header">
              <div>
                <h3 className="fc-card-title">
                  <TrendingUp size={17} style={{ color: "var(--accent)" }} />
                  <span>Evolução dos Últimos 6 Meses</span>
                </h3>
                <p className="fc-card-subtitle">Comparativo mensal de Ganhos vs. Gastos</p>
              </div>
            </div>

            <div className="fc-bars-wrapper">
              {last6Data.map((d) => (
                <div key={d.month} className="fc-chart-col">
                  <div className="fc-chart-bars">
                    <div
                      className="fc-chart-stick gain"
                      style={{ height: `${d.inHeight}px` }}
                      title={`Ganhos ${d.label}: ${brl(d.inVal)}`}
                    />
                    <div
                      className="fc-chart-stick expense"
                      style={{ height: `${d.outHeight}px` }}
                      title={`Gastos ${d.label}: ${brl(d.outVal)}`}
                    />
                  </div>
                  <span className="fc-chart-label">{d.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ background: "var(--gain)" }} />
                <span>Ganhos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ background: "var(--expense)" }} />
                <span>Gastos</span>
              </div>
            </div>
          </div>

          {/* Distribuição por Categoria */}
          <div className="fc-card">
            <div className="fc-card-header">
              <div>
                <h3 className="fc-card-title">
                  <ArrowUpDown size={17} style={{ color: "var(--accent)" }} />
                  <span>Gastos por Categoria</span>
                </h3>
                <p className="fc-card-subtitle">Distribuição proporcional das despesas no período</p>
              </div>
            </div>

            {catDistribution.length === 0 ? (
              <div className="p-8 text-center text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                Nenhum gasto registrado neste período.
              </div>
            ) : (
              <div className="space-y-3.5 mt-2">
                {catDistribution.map((c) => (
                  <div key={c.cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span style={{ color: "var(--text)" }}>{c.cat}</span>
                      <div className="flex items-center gap-2">
                        <span className="num-tabular" style={{ color: "var(--text-muted)" }}>
                          {c.pct}%
                        </span>
                        <span className="num-tabular" style={{ color: "var(--expense)" }}>
                          {brl(c.amount)}
                        </span>
                      </div>
                    </div>
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ background: "var(--subtle)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${c.pct}%`,
                          background: "var(--expense)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* TABELA ANALÍTICA DE MOVIMENTAÇÕES */}
        <section className="fc-card" style={{ marginTop: 24 }}>
          <div className="fc-card-header">
            <div>
              <h3 className="fc-card-title">
                <Calendar size={17} style={{ color: "var(--accent)" }} />
                <span>Tabela Analítica de Movimentações</span>
              </h3>
              <p className="fc-card-subtitle">Visão contábil detalhada de todas as entradas e saídas</p>
            </div>
          </div>

          <div className="fc-table-wrapper">
            <table className="fc-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Valor</th>
                  <th style={{ textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
                      Sem movimentações registradas para os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => {
                    const isGain = t.type === "in";
                    return (
                      <tr key={t.id}>
                        <td className="num-tabular font-medium">
                          {t.date.split("-").reverse().join("/")}
                        </td>
                        <td className="font-semibold">{t.desc}</td>
                        <td>
                          <span className="fc-tx-cat-pill">{t.cat}</span>
                        </td>
                        <td>
                          <span
                            className="font-bold text-xs"
                            style={{ color: isGain ? "var(--gain)" : "var(--expense)" }}
                          >
                            {isGain ? "Ganho" : "Gasto"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => toggleDone(t.id, !t.done)}
                            className={`fc-badge fc-badge-interactive ${
                              t.done ? "fc-badge-gain" : "fc-badge-pending"
                            }`}
                          >
                            {t.done ? "Realizado" : "Previsto"}
                          </button>
                        </td>
                        <td
                          className="num-tabular font-bold"
                          style={{
                            textAlign: "right",
                            color: isGain ? "var(--gain)" : "var(--expense)",
                          }}
                        >
                          {isGain ? "+" : "−"} {brl(t.amount)}
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(t)}
                              className="fc-tx-action-btn"
                              title="Editar"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingTx(t)}
                              className="fc-tx-action-btn delete"
                              title="Excluir"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal de Criação / Edição de Transação */}
      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          initialData={editingTx}
          defaultType={modalDefaultType}
          currentMonth={currentMonth}
          onSubmit={async (data) => {
            if (editingTx) {
              if (data.updateScope === "future") {
                await updateSeriesFuture(editingTx.seriesId!, editingTx.seriesIndex || 1, data);
              } else if (data.updateScope === "all") {
                await updateSeriesAll(editingTx.seriesId!, data);
              } else {
                await updateTransaction(editingTx.id, data);
              }
            } else {
              if (data.repeatMonths && data.repeatMonths > 1) {
                await addSeries(data, data.repeatMonths);
              } else {
                await addTransaction(data);
              }
            }
          }}
        />
      )}

      {/* Modal de Exclusão de Série */}
      {deletingTx && (
        <SeriesDeleteModal
          isOpen={!!deletingTx}
          transaction={deletingTx}
          onClose={() => setDeletingTx(null)}
          onDeleteSingle={async () => {
            await deleteTransaction(deletingTx.id);
            setDeletingTx(null);
          }}
          onDeleteSeries={async () => {
            if (deletingTx.seriesId) {
              await deleteSeries(deletingTx.seriesId);
            } else {
              await deleteTransaction(deletingTx.id);
            }
            setDeletingTx(null);
          }}
        />
      )}
    </div>
  );
}
