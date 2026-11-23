"use client";

import { useState, useEffect } from "react";
import { Goal } from "@/types";
import { parseBRL } from "@/lib/utils";
import { X, AlertCircle } from "lucide-react";

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdate?: (id: string, data: Partial<Goal>) => Promise<void>;
  initialData?: Goal | null;
}

export function GoalModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  initialData,
}: GoalModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [targetStr, setTargetStr] = useState("");
  const [currentStr, setCurrentStr] = useState("");
  const [monthlyStr, setMonthlyStr] = useState("");
  const [deadline, setDeadline] = useState("");
  const [type, setType] = useState<"emergency" | "goal">("goal");
  const [status, setStatus] = useState<"active" | "achieved" | "paused">("active");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDesc(initialData.description || "");
      setTargetStr(initialData.targetAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
      setCurrentStr(initialData.currentAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
      setMonthlyStr(initialData.monthlyContribution ? initialData.monthlyContribution.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");
      setDeadline(initialData.deadline || "");
      setType(initialData.type);
      setStatus(initialData.status);
    } else {
      setName("");
      setDesc("");
      setTargetStr("");
      setCurrentStr("0,00");
      setMonthlyStr("");
      setDeadline("");
      setType("goal");
      setStatus("active");
    }
    setError("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialData;

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
        deadline: deadline || undefined,
        type,
        status: currentAmount >= targetAmount ? ("achieved" as const) : status,
      };

      if (isEditing && initialData && onUpdate) {
        await onUpdate(initialData.id, payload);
      } else {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-xl border modal-animate overflow-hidden shadow-2xl"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
            {isEditing ? "Editar Objetivo" : "Novo Objetivo ou Reserva"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md" style={{ color: "var(--muted)" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-2.5 rounded-md text-xs"
              style={{ background: "var(--expense-bg)", color: "var(--expense)", border: "1px solid var(--expense-border)" }}
            >
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Tipo de Meta */}
          <div className="grid grid-cols-2 p-1 rounded-lg border text-xs font-semibold" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
            <button
              type="button"
              onClick={() => setType("goal")}
              className={`py-2 rounded-md transition-all ${type === "goal" ? "shadow-sm font-bold" : "opacity-60"}`}
              style={{
                background: type === "goal" ? "var(--gain-bg)" : "transparent",
                color: type === "goal" ? "var(--gain)" : "var(--muted)",
                border: type === "goal" ? "1px solid var(--gain-border)" : "1px solid transparent",
              }}
            >
              Meta Principal / Específica
            </button>
            <button
              type="button"
              onClick={() => setType("emergency")}
              className={`py-2 rounded-md transition-all ${type === "emergency" ? "shadow-sm font-bold" : "opacity-60"}`}
              style={{
                background: type === "emergency" ? "var(--accent-bg)" : "transparent",
                color: type === "emergency" ? "var(--accent)" : "var(--muted)",
                border: type === "emergency" ? "1px solid var(--border)" : "1px solid transparent",
              }}
            >
              Fundo de Emergência
            </button>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              Nome do Objetivo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "emergency" ? "Fundo de Emergência (6 meses)" : "Ex.: Viagem de Formatura, Carro…"}
              required
              className="w-full px-3 py-2 text-sm rounded-md border outline-none"
              style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              Propósito / Regras
            </label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex.: Isolado em CDB com liquidez diária"
              className="w-full px-3 py-2 text-sm rounded-md border outline-none"
              style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
            />
          </div>

          {/* Valores: Alvo e Acumulado Atual */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Valor Alvo (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={targetStr}
                onChange={(e) => setTargetStr(e.target.value)}
                placeholder="0,00"
                required
                className="w-full px-3 py-2 text-sm rounded-md border outline-none font-semibold tabular"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Já Guardado (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={currentStr}
                onChange={(e) => setCurrentStr(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 text-sm rounded-md border outline-none font-semibold tabular"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          </div>

          {/* Aporte Mensal e Prazo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Aporte Mensal (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={monthlyStr}
                onChange={(e) => setMonthlyStr(e.target.value)}
                placeholder="Ex.: 250,00"
                className="w-full px-3 py-2 text-sm rounded-md border outline-none font-semibold tabular"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                Prazo Estimado (Mês/Ano)
              </label>
              <input
                type="month"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border outline-none"
                style={{ background: "var(--subtle)", borderColor: "var(--border)", color: "var(--text)" }}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60 shadow-sm"
              style={{ background: "var(--accent)" }}
            >
              {loading ? "Salvando…" : isEditing ? "Salvar alterações" : "Criar Objetivo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
