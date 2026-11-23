"use client";

import { useState, useEffect } from "react";
import { Transaction, TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
import { todayStr, parseBRL } from "@/lib/utils";
import { X, Layers, AlertCircle, TrendingUp, TrendingDown, Calendar, Tag, CheckCircle2, Clock } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    desc: string;
    amount: number;
    type: TransactionType;
    cat: string;
    date: string;
    done: boolean;
    repeatMonths?: number;
    updateScope?: "single" | "future" | "all";
  }) => Promise<void>;
  onSaveSingle?: (tx: Omit<Transaction, "id" | "userId" | "createdAt">) => Promise<void>;
  onSaveSeries?: (base: Omit<Transaction, "id" | "userId" | "createdAt">, months: number) => Promise<void>;
  onUpdateSingle?: (id: string, data: Partial<Transaction>) => Promise<void>;
  onUpdateSeriesFuture?: (seriesId: string, fromIndex: number, data: Partial<Transaction>) => Promise<void>;
  onUpdateSeriesAll?: (seriesId: string, data: Partial<Transaction>) => Promise<void>;
  initialData?: Transaction | null;
  defaultType?: TransactionType;
  currentMonth?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  onSaveSingle,
  onSaveSeries,
  onUpdateSingle,
  onUpdateSeriesFuture,
  onUpdateSeriesAll,
  initialData,
  defaultType = "out",
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [desc, setDesc] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [cat, setCat] = useState("");
  const [date, setDate] = useState("2026-11-22");
  const [reps, setReps] = useState(1);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Escopo de edição em caso de série
  const [seriesScope, setSeriesScope] = useState<"single" | "future" | "all">("single");

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDesc(initialData.desc);
      setAmountStr(initialData.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
      setCat(initialData.cat);
      setDate(initialData.date);
      setDone(initialData.done);
      setReps(1);
      setSeriesScope("single");
    } else {
      setType(defaultType);
      setDesc("");
      setAmountStr("");
      setCat(defaultType === "in" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
      setDate(todayStr());
      setReps(1);
      setDone(false);
      setSeriesScope("single");
    }
    setError("");
  }, [initialData, defaultType, isOpen]);

  useEffect(() => {
    if (!initialData) {
      setCat(type === "in" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    }
  }, [type, initialData]);

  if (!isOpen) return null;

  const isEditing = !!initialData;
  const isPartOfSeries = !!initialData?.seriesId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const amount = parseBRL(amountStr);

    if (!(amount > 0)) {
      setError("Informe um valor maior que zero.");
      return;
    }
    if (!date) {
      setError("Escolha a data.");
      return;
    }
    if (reps < 1 || reps > 60) {
      setError("Repetição: informe entre 1 e 60 meses.");
      return;
    }

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit({
          desc: desc.trim() || cat,
          amount,
          type,
          cat,
          date,
          done,
          repeatMonths: reps,
          updateScope: seriesScope,
        });
      } else if (isEditing && initialData) {
        const payload: Partial<Transaction> = {
          desc: desc.trim() || cat,
          amount,
          type,
          cat,
          date,
          done,
        };

        if (isPartOfSeries && initialData.seriesId) {
          if (seriesScope === "all" && onUpdateSeriesAll) {
            await onUpdateSeriesAll(initialData.seriesId, {
              desc: desc.trim() || cat,
              amount,
              type,
              cat,
            });
          } else if (seriesScope === "future" && onUpdateSeriesFuture && initialData.seriesIndex) {
            await onUpdateSeriesFuture(initialData.seriesId, initialData.seriesIndex, {
              desc: desc.trim() || cat,
              amount,
              type,
              cat,
            });
          } else if (onUpdateSingle) {
            await onUpdateSingle(initialData.id, payload);
          }
        } else if (onUpdateSingle) {
          await onUpdateSingle(initialData.id, payload);
        }
      } else {
        const payload = {
          desc: desc.trim() || cat,
          amount,
          type,
          cat,
          date,
          done,
        };

        if (reps > 1 && onSaveSeries) {
          await onSaveSeries(payload, reps);
        } else if (onSaveSingle) {
          await onSaveSingle(payload);
        }
      }
      onClose();
    } catch (err: any) {
      setError("Erro ao salvar lançamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const categories = type === "in" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fc-modal-overlay">
      <div className="fc-modal-sheet">
        {/* Header do Modal */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2">
            {type === "in" ? (
              <TrendingUp size={20} style={{ color: "var(--gain)" }} />
            ) : (
              <TrendingDown size={20} style={{ color: "var(--expense)" }} />
            )}
            <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
              {isEditing ? "Editar Lançamento" : type === "in" ? "Novo Ganho" : "Novo Gasto"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md transition-colors hover:opacity-75"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg text-xs font-semibold"
              style={{
                background: "var(--expense-bg)",
                color: "var(--expense)",
                border: "1px solid var(--expense-border)",
              }}
            >
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Seletor Tipo: Gasto / Ganho */}
          {!isEditing && (
            <div
              className="grid grid-cols-2 p-1 rounded-xl border text-xs font-bold"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <button
                type="button"
                onClick={() => setType("out")}
                className={`py-2 rounded-lg transition-all ${
                  type === "out" ? "shadow-sm font-black" : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  background: type === "out" ? "var(--expense-bg)" : "transparent",
                  color: type === "out" ? "var(--expense)" : "var(--text-muted)",
                  border: type === "out" ? "1px solid var(--expense-border)" : "1px solid transparent",
                }}
              >
                − Gasto (Despesa)
              </button>
              <button
                type="button"
                onClick={() => setType("in")}
                className={`py-2 rounded-lg transition-all ${
                  type === "in" ? "shadow-sm font-black" : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  background: type === "in" ? "var(--gain-bg)" : "transparent",
                  color: type === "in" ? "var(--gain)" : "var(--text-muted)",
                  border: type === "in" ? "1px solid var(--gain-border)" : "1px solid transparent",
                }}
              >
                + Ganho (Receita)
              </button>
            </div>
          )}

          {/* Descrição e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="fc-label">Descrição</label>
              <input
                type="text"
                placeholder={type === "in" ? "Ex.: Salário, Venda" : "Ex.: Mercado, Aluguel"}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="fc-input"
                required
              />
            </div>
            <div>
              <label className="fc-label">Valor (R$)</label>
              <input
                type="text"
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="fc-input font-bold"
                required
              />
            </div>
          </div>

          {/* Categoria e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="fc-label">Categoria</label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="fc-select"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="fc-label">Data de Vencimento / Crédito</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="fc-input"
                required
              />
            </div>
          </div>

          {/* Repetição em Meses (Série de Parcelas) */}
          {!isEditing && (
            <div
              className="p-3.5 rounded-xl border space-y-2.5"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>
                  Repetição / Parcelamento
                </span>
                <span className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>
                  {reps > 1 ? `Repetir por ${reps} meses` : "Lançamento único"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={reps}
                  onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                  className="flex-1 accent-blue-600"
                />
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={reps}
                  onChange={(e) => setReps(Math.min(60, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="fc-input text-center font-bold"
                  style={{ width: 64, padding: "4px 8px" }}
                />
              </div>
            </div>
          )}

          {/* Escopo de Edição em caso de Série */}
          {isPartOfSeries && (
            <div
              className="p-3.5 rounded-xl border space-y-2"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <div className="text-xs font-bold" style={{ color: "var(--text)" }}>
                Este lançamento faz parte de uma série ({initialData?.seriesIndex}/{initialData?.seriesTotal})
              </div>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="scope"
                    checked={seriesScope === "single"}
                    onChange={() => setSeriesScope("single")}
                  />
                  <span>Alterar apenas esta parcela</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="scope"
                    checked={seriesScope === "future"}
                    onChange={() => setSeriesScope("future")}
                  />
                  <span>Alterar esta e as parcelas futuras</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="scope"
                    checked={seriesScope === "all"}
                    onChange={() => setSeriesScope("all")}
                  />
                  <span>Alterar todas as parcelas da série</span>
                </label>
              </div>
            </div>
          )}

          {/* Status Inicial: Previsto ou Realizado */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="tx-done-checkbox"
              checked={done}
              onChange={(e) => setDone(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
            />
            <label htmlFor="tx-done-checkbox" className="text-xs font-bold cursor-pointer" style={{ color: "var(--text)" }}>
              {type === "in" ? "Já foi recebido na conta" : "Já foi pago"}
            </label>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={onClose}
              className="fc-btn fc-btn-secondary fc-btn-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`fc-btn fc-btn-sm font-bold ${
                type === "in" ? "fc-btn-gain" : "fc-btn-expense"
              }`}
            >
              {loading ? "Salvando…" : isEditing ? "Salvar Alterações" : "Adicionar Lançamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
