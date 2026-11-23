"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useGoals } from "@/lib/hooks/useGoals";
import { Navbar } from "@/components/Navbar";
import { TransactionModal } from "@/components/TransactionModal";
import {
  brl,
  ym,
  shiftMonth,
  monthShort,
  get13Months,
} from "@/lib/utils";
import {
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileSpreadsheet,
} from "lucide-react";

export default function TrezeMesesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [startMonth, setStartMonth] = useState("2026-11");
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  useEffect(() => {
    setStartMonth(ym(new Date()));
  }, []);

  const { transactions, addTransaction, addSeries } = useTransactions();
  const { goals } = useGoals();

  const months13 = useMemo(() => get13Months(startMonth), [startMonth]);

  // Cálculos por mês para os 13 meses
  const matrixData = useMemo(() => {
    let runningAccumulatedBalance = 0;

    return months13.map((m) => {
      const monthTx = transactions.filter((t) => t.date.startsWith(m));

      let salaryIn = 0;
      let vtIn = 0;
      let otherIn = 0;

      let housingOut = 0;
      let foodOut = 0;
      let transportOut = 0;
      let eduOut = 0;
      let subOut = 0;
      let cardOut = 0;
      let otherOut = 0;

      monthTx.forEach((t) => {
        if (t.type === "in") {
          if (t.cat.includes("Salário") || t.cat.includes("Bolsa")) salaryIn += t.amount;
          else if (t.cat.includes("Transporte") || t.cat.includes("VT")) vtIn += t.amount;
          else otherIn += t.amount;
        } else {
          if (t.cat.includes("Moradia") || t.cat.includes("Habitação")) housingOut += t.amount;
          else if (t.cat.includes("Alimentação")) foodOut += t.amount;
          else if (t.cat.includes("Transporte")) transportOut += t.amount;
          else if (t.cat.includes("Educação")) eduOut += t.amount;
          else if (t.cat.includes("Assinatura")) subOut += t.amount;
          else if (t.cat.includes("Cartão")) cardOut += t.amount;
          else otherOut += t.amount;
        }
      });

      const totalIn = salaryIn + vtIn + otherIn;
      const totalOut = housingOut + foodOut + transportOut + eduOut + subOut + cardOut + otherOut;

      // Reservas mensais somadas das metas ativas
      let goalReservations = 0;
      let emergencyReservations = 0;
      goals.forEach((g) => {
        if (g.status === "active" && g.monthlyContribution > 0) {
          if (g.type === "emergency") emergencyReservations += g.monthlyContribution;
          else goalReservations += g.monthlyContribution;
        }
      });
      const totalReserves = goalReservations + emergencyReservations;

      const monthlyBalance = totalIn - totalOut - totalReserves;
      runningAccumulatedBalance += monthlyBalance;

      return {
        month: m,
        label: monthShort(m),
        salaryIn,
        vtIn,
        otherIn,
        totalIn,
        housingOut,
        foodOut,
        transportOut,
        eduOut,
        subOut,
        cardOut,
        otherOut,
        totalOut,
        goalReservations,
        emergencyReservations,
        totalReserves,
        monthlyBalance,
        accumulatedBalance: runningAccumulatedBalance,
      };
    });
  }, [months13, transactions, goals]);

  // Totais consolidados de 13 Meses
  const totals13M = useMemo(() => {
    let sumIn = 0;
    let sumOut = 0;
    let sumReserves = 0;

    matrixData.forEach((d) => {
      sumIn += d.totalIn;
      sumOut += d.totalOut;
      sumReserves += d.totalReserves;
    });

    const finalAccumulated = matrixData[matrixData.length - 1]?.accumulatedBalance || 0;

    return {
      sumIn,
      sumOut,
      sumReserves,
      finalAccumulated,
    };
  }, [matrixData]);

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

  // Exportar dados como CSV
  const exportCSV = () => {
    const headers = [
      "Mês",
      "Salários",
      "Auxílio-Transporte",
      "Outros Ganhos",
      "Total Entradas",
      "Moradia",
      "Alimentação",
      "Transporte",
      "Educação",
      "Assinaturas",
      "Cartão",
      "Outros Gastos",
      "Total Despesas",
      "Reserva Metas",
      "Reserva Emergência",
      "Saldo Mensal Livre",
      "Saldo Acumulado",
    ];

    const rows = matrixData.map((d) => [
      d.month,
      d.salaryIn.toFixed(2),
      d.vtIn.toFixed(2),
      d.otherIn.toFixed(2),
      d.totalIn.toFixed(2),
      d.housingOut.toFixed(2),
      d.foodOut.toFixed(2),
      d.transportOut.toFixed(2),
      d.eduOut.toFixed(2),
      d.subOut.toFixed(2),
      d.cardOut.toFixed(2),
      d.otherOut.toFixed(2),
      d.totalOut.toFixed(2),
      d.goalReservations.toFixed(2),
      d.emergencyReservations.toFixed(2),
      d.monthlyBalance.toFixed(2),
      d.accumulatedBalance.toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fincontrole_13_meses_${startMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar onOpenNewTx={() => setIsTxModalOpen(true)} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>
                Horizonte Ampliado
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className="text-xs" style={{ color: "var(--muted)" }}>Previsibilidade de Fluxo de Caixa</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Planejamento dos 13 Meses</h1>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Visão matricial consolidada de 13 meses para antecipar sazonalidades, reservas e metas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold text-xs border transition-opacity hover:opacity-80 shadow-sm"
              style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
            >
              <Download size={14} />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Seletor de Horizonte de Início dos 13 Meses */}
        <div
          className="flex items-center justify-between p-3 rounded-xl border shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: "var(--accent)" }} />
            <span className="text-xs font-semibold">Início do Ciclo:</span>
            <input
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="px-2 py-1 text-xs rounded border outline-none font-semibold"
              style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border hidden sm:inline-block" style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--muted)" }}>
            Horizonte de 13 meses contínuos
          </span>
        </div>

        {/* 3 Cards de Resumo 13M */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-xl p-5 border shadow-sm"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>
                Total Entradas Previstas (13M)
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--gain-bg)", color: "var(--gain)" }}
              >
                <TrendingUp size={15} />
              </div>
            </div>
            <div className="text-2xl font-black tabular" style={{ color: "var(--gain)" }}>
              {brl(totals13M.sumIn)}
            </div>
            <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              Média mensal: {brl(totals13M.sumIn / 13)}
            </div>
          </div>

          <div
            className="rounded-xl p-5 border shadow-sm"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>
                Total Despesas Previstas (13M)
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--expense-bg)", color: "var(--expense)" }}
              >
                <TrendingDown size={15} />
              </div>
            </div>
            <div className="text-2xl font-black tabular" style={{ color: "var(--expense)" }}>
              {brl(totals13M.sumOut)}
            </div>
            <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              Média mensal: {brl(totals13M.sumOut / 13)}
            </div>
          </div>

          <div
            className="rounded-xl p-5 border shadow-sm"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider" style={{ color: "var(--muted)" }}>
                Saldo Livre Projetado Acumulado
              </span>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
              >
                <Wallet size={15} />
              </div>
            </div>
            <div
              className="text-2xl font-black tabular"
              style={{ color: totals13M.finalAccumulated >= 0 ? "var(--accent)" : "var(--expense)" }}
            >
              {brl(totals13M.finalAccumulated)}
            </div>
            <div className="text-xs mt-2" style={{ color: "var(--muted)" }}>
              Líquido final ao término do 13º mês
            </div>
          </div>
        </section>

        {/* Grade Matriz de 13 Meses */}
        <section
          className="rounded-xl p-5 border shadow-sm space-y-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight">Grade de Controle Matricial (13 Meses)</h2>
            <span className="text-xs" style={{ color: "var(--muted)" }}>Valores expressos em R$</span>
          </div>

          <div className="w-full overflow-x-auto border rounded-xl" style={{ borderColor: "var(--border)" }}>
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b font-semibold" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                  <th className="py-3 px-4 text-left sticky left-0 z-10 border-r min-w-[200px]" style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}>
                    Item / Categoria
                  </th>
                  {matrixData.map((d) => (
                    <th key={d.month} className="py-3 px-3 uppercase text-center min-w-[100px]" style={{ color: "var(--muted)" }}>
                      {d.label}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right min-w-[120px] font-bold" style={{ color: "var(--text)" }}>
                    Total 13M
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {/* SEÇÃO: ENTRADAS */}
                <tr className="font-bold text-left" style={{ background: "var(--gain-bg)", color: "var(--gain)" }}>
                  <td colSpan={15} className="py-1.5 px-4 uppercase text-[11px] tracking-wider">
                    ENTRADAS
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Salários / Bolsas
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{d.salaryIn ? brl(d.salaryIn) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.salaryIn, 0))}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Auxílio-transporte (VT)
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{d.vtIn ? brl(d.vtIn) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.vtIn, 0))}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Outros recebimentos
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{d.otherIn ? brl(d.otherIn) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.otherIn, 0))}</td>
                </tr>
                <tr className="font-bold border-b-2" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                  <td className="py-2.5 px-4 text-left sticky left-0 border-r" style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--gain)" }}>
                    TOTAL DE ENTRADAS
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2.5 px-3 tabular" style={{ color: "var(--gain)" }}>{brl(d.totalIn)}</td>
                  ))}
                  <td className="py-2.5 px-4 tabular" style={{ color: "var(--gain)" }}>{brl(totals13M.sumIn)}</td>
                </tr>

                {/* SEÇÃO: DESPESAS */}
                <tr className="font-bold text-left" style={{ background: "var(--expense-bg)", color: "var(--expense)" }}>
                  <td colSpan={15} className="py-1.5 px-4 uppercase text-[11px] tracking-wider">
                    DESPESAS
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Moradia &amp; Habitação
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{d.housingOut ? brl(d.housingOut) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.housingOut, 0))}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Alimentação
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{d.foodOut ? brl(d.foodOut) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.foodOut, 0))}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Transporte público &amp; combustível
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{d.transportOut ? brl(d.transportOut) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.transportOut, 0))}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Educação &amp; Cursos
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{d.eduOut ? brl(d.eduOut) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.eduOut, 0))}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Cartão de crédito &amp; assinaturas
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{(d.cardOut + d.subOut) ? brl(d.cardOut + d.subOut) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.cardOut + d.subOut, 0))}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Outros gastos &amp; extras
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{d.otherOut ? brl(d.otherOut) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.otherOut, 0))}</td>
                </tr>
                <tr className="font-bold border-b-2" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                  <td className="py-2.5 px-4 text-left sticky left-0 border-r" style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--expense)" }}>
                    TOTAL DE DESPESAS
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2.5 px-3 tabular" style={{ color: "var(--expense)" }}>{brl(d.totalOut)}</td>
                  ))}
                  <td className="py-2.5 px-4 tabular" style={{ color: "var(--expense)" }}>{brl(totals13M.sumOut)}</td>
                </tr>

                {/* SEÇÃO: RESERVAS & METAS */}
                <tr className="font-bold text-left" style={{ background: "var(--accent-bg)", color: "var(--accent)" }}>
                  <td colSpan={15} className="py-1.5 px-4 uppercase text-[11px] tracking-wider">
                    RESERVAS (METAS E FUNDO DE EMERGÊNCIA SEPARADOS)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Fundo de emergência (aporte do mês)
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{d.emergencyReservations ? brl(d.emergencyReservations) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.emergencyReservations, 0))}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 text-left font-medium sticky left-0 border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    Metas pessoais / Objetivos
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2 px-3 tabular">{d.goalReservations ? brl(d.goalReservations) : "—"}</td>
                  ))}
                  <td className="py-2 px-4 tabular font-bold">{brl(matrixData.reduce((acc, d) => acc + d.goalReservations, 0))}</td>
                </tr>
                <tr className="font-bold border-b-2" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
                  <td className="py-2.5 px-4 text-left sticky left-0 border-r" style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--accent)" }}>
                    TOTAL RESERVAS
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} className="py-2.5 px-3 tabular" style={{ color: "var(--accent)" }}>{brl(d.totalReserves)}</td>
                  ))}
                  <td className="py-2.5 px-4 tabular" style={{ color: "var(--accent)" }}>{brl(totals13M.sumReserves)}</td>
                </tr>

                {/* RESULTADO FINAL */}
                <tr className="font-bold" style={{ background: "var(--subtle)" }}>
                  <td className="py-3 px-4 text-left sticky left-0 border-r" style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}>
                    SALDO MENSAL LIVRE (Entradas − Despesas − Reservas)
                  </td>
                  {matrixData.map((d) => (
                    <td
                      key={d.month}
                      className="py-3 px-3 tabular"
                      style={{ color: d.monthlyBalance >= 0 ? "var(--gain)" : "var(--expense)" }}
                    >
                      {brl(d.monthlyBalance)}
                    </td>
                  ))}
                  <td className="py-3 px-4 tabular font-black" style={{ color: "var(--text)" }}>
                    {brl(totals13M.sumIn - totals13M.sumOut - totals13M.sumReserves)}
                  </td>
                </tr>

                <tr className="font-bold text-sm" style={{ background: "var(--surface)" }}>
                  <td className="py-3 px-4 text-left sticky left-0 border-r font-black" style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--accent)" }}>
                    SALDO ACUMULADO PROJETADO
                  </td>
                  {matrixData.map((d) => (
                    <td
                      key={d.month}
                      className="py-3 px-3 tabular font-black"
                      style={{ color: d.accumulatedBalance >= 0 ? "var(--accent)" : "var(--expense)" }}
                    >
                      {brl(d.accumulatedBalance)}
                    </td>
                  ))}
                  <td className="py-3 px-4 tabular font-black" style={{ color: "var(--accent)" }}>
                    {brl(totals13M.finalAccumulated)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
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
