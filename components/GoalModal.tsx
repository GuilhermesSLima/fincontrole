"use client";

import { useState, useEffect } from "react";
import { Goal } from "@/types";
import { parseBRL } from "@/lib/utils";
import { X, Target, ShieldCheck, AlertCircle } from "lucide-react";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (goal: Omit<Goal, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  onSave?: (goal: Omit<Goal, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdate?: (id: string, data: Partial<Goal>) => Promise<void>;
  initialData?: Goal | null;
}

export function GoalModal({
  isOpen,
  onClose,
  onSubmit,
  onSave,
  onUpdate,
  initialData,
}: GoalModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [targetStr, setTargetStr] = useState("");
  const [currentStr, setCurrentStr] = useState("");
  const [monthlyStr, setMonthlyStr] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [type, setType] = useState<"emergency" | "goal">("goal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDesc(initialData.description || "");
      setTargetStr(initialData.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
      setCurrentStr(initialData.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
      setMonthlyStr(initialData.monthlyContribution ? initialData.monthlyContribution.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");
      setTargetDate(initialData.deadline || "");
      setType(initialData.type);
    } else {
      setName("");
      setDesc("");
      setTargetStr("");
      setCurrentStr("0,00");
      setMonthlyStr("");
      setTargetDate("");
      setType("goal");
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialData && !!initialData.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const targetAmount = parseBRL(targetStr);
    const currentAmount = parseBRL(currentStr);
    const monthlyContribution = parseBRL(monthlyStr);

    if (!name.trim()) {
      setError("Informe o nome do objetivo.");
      return;
    }
    if (!(targetAmount > 0)) {
      setError("Informe um valor-alvo maior que zero.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: desc.trim(),
        targetAmount,
        currentAmount,
        monthlyContribution,
        deadline: targetDate || undefined,
        type,
        status: (currentAmount >= targetAmount ? "achieved" : "active") as "active" | "achieved" | "paused",
      };

      if (onSubmit) {
        await onSubmit(payload);
      } else if (isEditing && initialData?.id && onUpdate) {
        await onUpdate(initialData.id, payload);
      } else if (onSave) {
        await onSave(payload);
      }
      onClose();
    } catch (err: any) {
      setError("Erro ao salvar objetivo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fc-modal-overlay">
      <div className="fc-modal-sheet" style={{ maxWidth: 460 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            {type === "emergency" ? (
              <ShieldCheck size={20} style={{ color: "var(--accent)" }} />
            ) : (
              <Target size={20} style={{ color: "var(--gain)" }} />
            )}
            <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
              {isEditing ? "Editar Objetivo" : "Novo Objetivo Financeiro"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600"
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

          {/* Seletor Tipo: Fundo de Emergência vs Meta Principal */}
          {!isEditing && (
            <div
              className="grid grid-cols-2 p-1 rounded-xl border text-xs font-bold"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <button
                type="button"
                onClick={() => setType("goal")}
                className={`py-2 rounded-lg transition-all ${
                  type === "goal" ? "shadow-sm font-black" : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  background: type === "goal" ? "var(--gain-bg)" : "transparent",
                  color: type === "goal" ? "var(--gain)" : "var(--text-muted)",
                  border: type === "goal" ? "1px solid var(--gain-border)" : "1px solid transparent",
                }}
              >
                🎯 Meta Principal
              </button>
              <button
                type="button"
                onClick={() => setType("emergency")}
                className={`py-2 rounded-lg transition-all ${
                  type === "emergency" ? "shadow-sm font-black" : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  background: type === "emergency" ? "var(--accent-bg)" : "transparent",
                  color: type === "emergency" ? "var(--accent)" : "var(--text-muted)",
                  border: type === "emergency" ? "1px solid var(--accent-border)" : "1px solid transparent",
                }}
              >
                🛡️ Fundo Emergência
              </button>
            </div>
          )}

          <div>
            <label className="fc-label">Nome do Objetivo</label>
            <input
              type="text"
              required
              placeholder={type === "emergency" ? "Ex.: Reserva de Emergência (6 meses)" : "Ex.: Viagem de Férias, Carro"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="fc-input font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="fc-label">Valor Alvo (R$)</label>
              <input
                type="text"
                required
                placeholder="0,00"
                value={targetStr}
                onChange={(e) => setTargetStr(e.target.value)}
                className="fc-input font-bold"
              />
            </div>
            <div>
              <label className="fc-label">Já Acumulado (R$)</label>
              <input
                type="text"
                placeholder="0,00"
                value={currentStr}
                onChange={(e) => setCurrentStr(e.target.value)}
                className="fc-input font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="fc-label">Aporte Mensal Planejado (R$)</label>
              <input
                type="text"
                placeholder="0,00"
                value={monthlyStr}
                onChange={(e) => setMonthlyStr(e.target.value)}
                className="fc-input"
              />
            </div>
            <div>
              <label className="fc-label">Data-Alvo / Prazo (Opcional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="fc-input"
              />
            </div>
          </div>

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
              className="fc-btn fc-btn-primary fc-btn-sm font-bold"
            >
              {loading ? "Salvando…" : isEditing ? "Salvar Alterações" : "Criar Objetivo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
