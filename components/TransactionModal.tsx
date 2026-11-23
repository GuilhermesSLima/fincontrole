"use client";

import { useState, useEffect } from "react";
import { Transaction, TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
import { todayStr, parseBRL } from "@/lib/utils";
import { X, Layers, AlertCircle } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSingle: (tx: Omit<Transaction, "id" | "userId" | "createdAt">) => Promise<void>;
  onSaveSeries: (base: Omit<Transaction, "id" | "userId" | "createdAt">, months: number) => Promise<void>;
  onUpdateSingle?: (id: string, data: Partial<Transaction>) => Promise<void>;
  onUpdateSeriesFuture?: (seriesId: string, fromIndex: number, data: Partial<Transaction>) => Promise<void>;
  onUpdateSeriesAll?: (seriesId: string, data: Partial<Transaction>) => Promise<void>;
  initialData?: Transaction | null;
  defaultType?: TransactionType;
}

export function TransactionModal({
  isOpen,
  onClose,
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
      if (isEditing && initialData) {
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

        if (reps > 1) {
          await onSaveSeries(payload, reps);
        } else {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-xl border modal-animate overflow-hidden shadow-2xl"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
            {isEditing ? "Editar Lançamento" : "Novo Lançamento"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md transition-colors hover:opacity-75"
            style={{ color: "var(--muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-2.5 rounded-md text-xs"
              style={{ background: "var(--expense-bg)", color: "var(--expense)", border: "1px solid var(--expense-border)" }}
            >
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Seletor Tipo: Gasto / Ganho */}
          <div className="grid grid-cols-2 p-1 rounded-lg border text-xs font-semibold" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={() => setType("out")}
              className={`py-2 rounded-md transition-all ${
                type === "out" ? "shadow-sm font-bold" : "opacity-60 hover:opacity-100"
              }`}
              style={{
                background: type === "out" ? "var(--expense-bg)" : "transparent",
                color: type === "out" ? "var(--expense)" : "var(--muted)",
                border: type === "out" ? "1px solid var(--expense-border)" : "1px solid transparent",
              }}
            >
              Gasto (−)
            </button>
            <button
              type="button"
              onClick={() => setType("in")}
              className={`py-2 rounded-md transition-all ${
                type === "in" ? "shadow-sm font-bold" : "opacity-60 hover:opacity-100"
              }`}
              style={{
                background: type === "in" ? "var(--gain-bg)" : "transparent",
                color: type === "in" ? "var(--gain)" : "var(--muted)",
                border: type === "in" ? "1px solid var(--gain-border)" : "1px solid transparent",
              }}
            >
              Ganho (+)
            </button>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              Descrição
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex.: Mensalidade faculdade, bolsa, mercado…"
              maxLength={80}
              className="w-full px-3 py-2 text-sm rounded-md border outline-none transition-all"
              style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Valor e Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Valor (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0,00"
                required
                className="w-full px-3 py-2 text-sm rounded-md border outline-none font-semibold tabular transition-all"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Categoria
              </label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border outline-none transition-all"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Data e Repetição */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-md border outline-none transition-all"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
            {!isEditing && (
              <div>
                <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                  Repetir (Meses)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={reps}
                  onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-sm rounded-md border outline-none transition-all"
                  style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>
            )}
          </div>

          {!isEditing && reps > 1 && (
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Serão geradas <strong>{reps} parcelas mensais</strong> sucessivas com identificador de série agrupada.
            </p>
          )}

          {/* Opções de Escopo de Edição para Séries */}
          {isEditing && isPartOfSeries && (
            <div className="p-3 rounded-lg border space-y-2" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--text)" }}>
                <Layers size={14} style={{ color: "var(--accent)" }} />
                <span>Esta parcela faz parte de uma série ({initialData.seriesIndex}/{initialData.seriesTotal})</span>
              </div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                O que você deseja atualizar com as alterações acima?
              </p>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={seriesScope === "single"}
                    onChange={() => setSeriesScope("single")}
                    className="accent-blue-600"
                  />
                  <span>Apenas esta parcela</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={seriesScope === "future"}
                    onChange={() => setSeriesScope("future")}
                    className="accent-blue-600"
                  />
                  <span>Esta e todas as parcelas futuras ({initialData.seriesIndex} até {initialData.seriesTotal})</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={seriesScope === "all"}
                    onChange={() => setSeriesScope("all")}
                    className="accent-blue-600"
                  />
                  <span>Todas as parcelas da série</span>
                </label>
              </div>
            </div>
          )}

          {/* Checkbox Realizado */}
          <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer pt-1" style={{ color: "var(--text)" }}>
            <input
              type="checkbox"
              checked={done}
              onChange={(e) => setDone(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"
            />
            <span>Já realizado ({type === "in" ? "recebido em conta" : "pago"})</span>
          </label>

          {/* Botão de Envio */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm"
              style={{
                background: type === "in" ? "var(--gain)" : "var(--expense)",
                color: "#ffffff",
              }}
            >
              {loading ? "Salvando…" : isEditing ? "Salvar alterações" : type === "in" ? "Adicionar ganho" : "Adicionar gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
