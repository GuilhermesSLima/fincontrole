// lib/hooks/useTransactions.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Transaction } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useTransactions(month?: string) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const q = query(collection(db, "transactions"), where("userId", "==", user.uid));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Transaction))
          .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.createdAt || 0) - (a.createdAt || 0));
        setTransactions(list);
        setLoading(false);
      },
      (err) => {
        console.warn("Aviso ao buscar transações no Firestore:", err.message);
        setError(err.code === "permission-denied" ? "permission-denied" : err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [user]);

  const addTransaction = useCallback(
    async (data: Omit<Transaction, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      const cleanData: any = {};
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined) cleanData[key] = val;
      });
      await addDoc(collection(db, "transactions"), {
        ...cleanData,
        userId: user.uid,
        createdAt: Date.now(),
      });
    },
    [user]
  );

  const batchAddTransactions = useCallback(
    async (items: Omit<Transaction, "id" | "userId" | "createdAt">[]) => {
      if (!user || !items.length) return 0;
      const CHUNK_SIZE = 400;
      let totalInserted = 0;
      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((item, idx) => {
          const ref = doc(collection(db, "transactions"));
          const cleanDoc: any = {
            userId: user.uid,
            createdAt: Date.now() + i + idx,
          };
          Object.entries(item).forEach(([k, v]) => {
            if (v !== undefined) cleanDoc[k] = v;
          });
          batch.set(ref, cleanDoc);
        });
        await batch.commit();
        totalInserted += chunk.length;
      }
      return totalInserted;
    },
    [user]
  );

  const addSeries = useCallback(
    async (
      base: Omit<Transaction, "id" | "userId" | "createdAt" | "seriesId" | "seriesIndex" | "seriesTotal">,
      months: number
    ) => {
      if (!user) return;
      const seriesId = crypto.randomUUID();
      const batch = writeBatch(db);
      const [year, mo, day] = base.date.split("-").map(Number);
      for (let i = 0; i < months; i++) {
        const d = new Date(year, mo - 1 + i, 1);
        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        const realDay = Math.min(day, lastDay);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(realDay).padStart(2, "0")}`;
        const ref = doc(collection(db, "transactions"));
        batch.set(ref, {
          ...base,
          desc: months > 1 ? `${base.desc} (${i + 1}/${months})` : base.desc,
          date: dateStr,
          userId: user.uid,
          seriesId,
          seriesIndex: i + 1,
          seriesTotal: months,
          done: i === 0 && base.done,
          createdAt: Date.now() + i,
        });
      }
      await batch.commit();
    },
    [user]
  );

  const toggleDone = useCallback(async (id: string, done: boolean) => {
    await updateDoc(doc(db, "transactions", id), { done });
  }, []);

  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    await updateDoc(doc(db, "transactions", id), data);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "transactions", id));
  }, []);

  const deleteSeries = useCallback(
    async (seriesId: string) => {
      if (!user) return;
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        where("seriesId", "==", seriesId)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    },
    [user]
  );

  const updateSeriesFuture = useCallback(
    async (seriesId: string, fromIndex: number, data: Partial<Transaction>) => {
      if (!user) return;
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        where("seriesId", "==", seriesId),
        where("seriesIndex", ">=", fromIndex)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((d) => batch.update(d.ref, data));
      await batch.commit();
    },
    [user]
  );

  const updateSeriesAll = useCallback(
    async (seriesId: string, data: Partial<Transaction>) => {
      if (!user) return;
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        where("seriesId", "==", seriesId)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((d) => batch.update(d.ref, data));
      await batch.commit();
    },
    [user]
  );

  return {
    transactions,
    loading,
    error,
    addTransaction,
    batchAddTransactions,
    addSeries,
    toggleDone,
    updateTransaction,
    deleteTransaction,
    deleteSeries,
    updateSeriesFuture,
    updateSeriesAll,
  };
}
