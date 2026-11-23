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

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

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

  // Exportação CSV fiel à planilha
  const exportCSV = () => {
    const headers = ["Linha / Categoria", ...matrixData.map((d) => d.label)].join(";");
    const rows = [
      ["(+) Salário Líquido", ...matrixData.map((d) => d.salaryIn.toFixed(2))].join(";"),
      ["(+) Vale-Transporte", ...matrixData.map((d) => d.vtIn.toFixed(2))].join(";"),
      ["(+) Outros Recebimentos", ...matrixData.map((d) => d.otherIn.toFixed(2))].join(";"),
      ["(=) TOTAL GANHOS", ...matrixData.map((d) => d.totalIn.toFixed(2))].join(";"),
      ["(-) Moradia", ...matrixData.map((d) => d.housingOut.toFixed(2))].join(";"),
      ["(-) Alimentação", ...matrixData.map((d) => d.foodOut.toFixed(2))].join(";"),
      ["(-) Transporte", ...matrixData.map((d) => d.transportOut.toFixed(2))].join(";"),
      ["(-) Educação", ...matrixData.map((d) => d.eduOut.toFixed(2))].join(";"),
      ["(-) Assinaturas / Recorrentes", ...matrixData.map((d) => d.subOut.toFixed(2))].join(";"),
      ["(-) Cartão de Crédito", ...matrixData.map((d) => d.cardOut.toFixed(2))].join(";"),
      ["(-) Outros Gastos", ...matrixData.map((d) => d.otherOut.toFixed(2))].join(";"),
      ["(=) TOTAL GASTOS", ...matrixData.map((d) => d.totalOut.toFixed(2))].join(";"),
      ["(-) Fundo de Emergência", ...matrixData.map((d) => d.emergencyReservations.toFixed(2))].join(";"),
      ["(-) Meta Principal", ...matrixData.map((d) => d.goalReservations.toFixed(2))].join(";"),
      ["(=) SALDO DO MÊS", ...matrixData.map((d) => d.monthlyBalance.toFixed(2))].join(";"),
      ["(=) SALDO ACUMULADO", ...matrixData.map((d) => d.accumulatedBalance.toFixed(2))].join(";"),
    ];

    const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `FinControle_13Meses_${startMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
          <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
            Carregando Planejamento…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar onOpenNewTx={() => setIsTxModalOpen(true)} />

      <main className="fc-container space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>
                Planejamento Anual
              </span>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--border-hover)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Visão de Longo Prazo
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text)" }}>
              Planejamento dos 13 Meses
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Grade dinâmica com projeção de ganhos, gastos fixos/variáveis, reservas e saldo acumulado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg bg-[var(--surface)] p-1 gap-1">
              <button
                type="button"
                onClick={() => setStartMonth((prev) => shiftMonth(prev, -1))}
                className="fc-month-nav-btn"
                style={{ width: 28, height: 28 }}
                title="Mês anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold px-2">{monthShort(startMonth)}</span>
              <button
                type="button"
                onClick={() => setStartMonth((prev) => shiftMonth(prev, 1))}
                className="fc-month-nav-btn"
                style={{ width: 28, height: 28 }}
                title="Próximo mês"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={exportCSV}
              className="fc-btn fc-btn-secondary fc-btn-sm"
              title="Baixar planilha CSV compatível com Excel"
            >
              <Download size={14} />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Tabela de 13 Meses */}
        <div className="fc-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="fc-table-wrapper" style={{ border: "none" }}>
            <table className="fc-table" style={{ fontSize: "0.8rem" }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 200, position: "sticky", left: 0, zIndex: 10, background: "var(--subtle)" }}>
                    Linha / Categoria
                  </th>
                  {matrixData.map((d) => (
                    <th key={d.month} style={{ textAlign: "right", minWidth: 100 }}>
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* GANHOS */}
                <tr style={{ background: "var(--gain-bg)" }}>
                  <td style={{ fontWeight: 800, color: "var(--gain-text)", position: "sticky", left: 0, background: "var(--gain-bg)", zIndex: 5 }}>
                    (+) GANHOS
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right", fontWeight: 800, color: "var(--gain-text)" }} className="num-tabular">
                      {brl(d.totalIn)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Salário Líquido
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.salaryIn)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Vale-Transporte
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.vtIn)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Outros Recebimentos
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.otherIn)}
                    </td>
                  ))}
                </tr>

                {/* GASTOS */}
                <tr style={{ background: "var(--expense-bg)" }}>
                  <td style={{ fontWeight: 800, color: "var(--expense-text)", position: "sticky", left: 0, background: "var(--expense-bg)", zIndex: 5 }}>
                    (−) GASTOS TOTAIS
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right", fontWeight: 800, color: "var(--expense-text)" }} className="num-tabular">
                      {brl(d.totalOut)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Moradia / Habitação
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.housingOut)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Alimentação
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.foodOut)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Transporte
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.transportOut)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Assinaturas / Recorrentes
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.subOut)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Cartão de Crédito
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.cardOut)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Outros Gastos
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.otherOut)}
                    </td>
                  ))}
                </tr>

                {/* RESERVAS */}
                <tr style={{ background: "var(--subtle)" }}>
                  <td style={{ fontWeight: 800, color: "var(--text-muted)", position: "sticky", left: 0, background: "var(--subtle)", zIndex: 5 }}>
                    (−) RESERVAS PLANEJADAS
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right", fontWeight: 700 }} className="num-tabular">
                      {brl(d.totalReserves)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Fundo de Emergência
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.emergencyReservations)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ paddingLeft: 24, position: "sticky", left: 0, background: "var(--surface)", zIndex: 5 }}>
                    Meta Principal
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right" }} className="num-tabular">
                      {brl(d.goalReservations)}
                    </td>
                  ))}
                </tr>

                {/* SALDOS */}
                <tr style={{ background: "var(--accent-bg)", borderTop: "2px solid var(--border)" }}>
                  <td style={{ fontWeight: 800, color: "var(--accent-text)", position: "sticky", left: 0, background: "var(--accent-bg)", zIndex: 5 }}>
                    (=) SALDO DO MÊS
                  </td>
                  {matrixData.map((d) => (
                    <td key={d.month} style={{ textAlign: "right", fontWeight: 800, color: "var(--accent-text)" }} className="num-tabular">
                      {brl(d.monthlyBalance)}
                    </td>
                  ))}
                </tr>
                <tr style={{ background: "var(--subtle)" }}>
                  <td style={{ fontWeight: 900, color: "var(--text)", position: "sticky", left: 0, background: "var(--subtle)", zIndex: 5 }}>
                    (=) SALDO ACUMULADO
                  </td>
                  {matrixData.map((d) => (
                    <td
                      key={d.month}
                      style={{
                        textAlign: "right",
                        fontWeight: 900,
                        color: d.accumulatedBalance >= 0 ? "var(--gain)" : "var(--expense)",
                      }}
                      className="num-tabular"
                    >
                      {brl(d.accumulatedBalance)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

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
