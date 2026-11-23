"use client";

import { useState } from "react";
import { Transaction } from "@/types";
import { X, AlertTriangle, Trash2 } from "lucide-react";

interface SeriesDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  tx?: Transaction | null;
  onDeleteSingle: (id: string) => Promise<void>;
  onDeleteSeries: (seriesId: string) => Promise<void>;
}

export function SeriesDeleteModal({
  isOpen,
  onClose,
  transaction,
  tx: propTx,
  onDeleteSingle,
  onDeleteSeries,
}: SeriesDeleteModalProps) {
  const currentTx = transaction || propTx;
  const [scope, setScope] = useState<"single" | "all">("single");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !currentTx) return null;

  const isSeries = !!currentTx.seriesId;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (isSeries && scope === "all" && currentTx.seriesId) {
        await onDeleteSeries(currentTx.seriesId);
      } else {
        await onDeleteSingle(currentTx.id);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fc-modal-overlay">
      <div className="fc-modal-sheet" style={{ maxWidth: 420 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2" style={{ color: "var(--expense)" }}>
            <AlertTriangle size={18} />
            <h3 className="font-bold text-sm" style={{ color: "var(--text)" }}>Excluir lançamento</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 space-y-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Tem certeza de que deseja remover <strong>&quot;{currentTx.desc}&quot;</strong>?
          </p>

          {isSeries && (
            <div
              className="p-3.5 rounded-xl border space-y-2 text-xs"
              style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
            >
              <div className="font-bold" style={{ color: "var(--text)" }}>
                Este lançamento faz parte de uma série ({currentTx.seriesIndex || 1}/{currentTx.seriesTotal || 1})
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="delScope"
                    checked={scope === "single"}
                    onChange={() => setScope("single")}
                  />
                  <span>Excluir apenas esta parcela</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold" style={{ color: "var(--expense)" }}>
                  <input
                    type="radio"
                    name="delScope"
                    checked={scope === "all"}
                    onChange={() => setScope("all")}
                  />
                  <span>Excluir toda a série ({currentTx.seriesTotal || 1} parcelas)</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="fc-btn fc-btn-secondary fc-btn-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="fc-btn fc-btn-expense fc-btn-sm font-bold"
            >
              {loading ? "Excluindo…" : "Confirmar Exclusão"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
