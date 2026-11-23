"use client";

import { useState } from "react";
import { Transaction } from "@/types";
import { X, AlertTriangle } from "lucide-react";

interface SeriesDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tx: Transaction | null;
  onDeleteSingle: (id: string) => Promise<void>;
  onDeleteSeries: (seriesId: string) => Promise<void>;
}

export function SeriesDeleteModal({
  isOpen,
  onClose,
  tx,
  onDeleteSingle,
  onDeleteSeries,
}: SeriesDeleteModalProps) {
  const [scope, setScope] = useState<"single" | "all">("single");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !tx) return null;

  const isSeries = !!tx.seriesId;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (isSeries && scope === "all" && tx.seriesId) {
        await onDeleteSeries(tx.seriesId);
      } else {
        await onDeleteSingle(tx.id);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-xl border modal-animate overflow-hidden shadow-2xl p-5 space-y-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2" style={{ color: "var(--expense)" }}>
            <AlertTriangle size={20} />
            <h3 className="font-bold text-sm" style={{ color: "var(--text)" }}>Excluir lançamento</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md" style={{ color: "var(--muted)" }}>
            <X size={16} />
          </button>
        </div>

        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Tem certeza de que deseja remover <strong>&quot;{tx.desc}&quot;</strong>?
        </p>

        {isSeries && (
          <div className="p-3 rounded-lg border space-y-2 text-xs" style={{ background: "var(--subtle)", borderColor: "var(--border)" }}>
            <div className="font-semibold" style={{ color: "var(--text)" }}>
              Este lançamento faz parte de uma série ({tx.seriesIndex}/{tx.seriesTotal})
            </div>
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delScope"
                  checked={scope === "single"}
                  onChange={() => setScope("single")}
                  className="accent-red-600"
                />
                <span>Excluir apenas esta parcela</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="delScope"
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                  className="accent-red-600"
                />
                <span className="font-semibold text-red-600 dark:text-red-400">
                  Excluir toda a série ({tx.seriesTotal} parcelas)
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-md text-xs font-semibold border transition-colors hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "var(--expense)" }}
          >
            {loading ? "Excluindo…" : "Confirmar exclusão"}
          </button>
        </div>
      </div>
    </div>
  );
}
