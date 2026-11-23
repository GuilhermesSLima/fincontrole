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

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const constraints: any[] = [where("userId", "==", user.uid), orderBy("date", "desc")];
    if (month) constraints.push(where("date", ">=", month + "-01"), where("date", "<=", month + "-31"));

    const q = query(collection(db, "transactions"), ...constraints);
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction)));
      setLoading(false);
    });
    return unsub;
  }, [user, month]);

  const addTransaction = useCallback(
    async (data: Omit<Transaction, "id" | "userId" | "createdAt">) => {
      if (!user) return;
      await addDoc(collection(db, "transactions"), {
        ...data,
        userId: user.uid,
        createdAt: Date.now(),
      });
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
    addTransaction,
    addSeries,
    toggleDone,
    updateTransaction,
    deleteTransaction,
    deleteSeries,
    updateSeriesFuture,
    updateSeriesAll,
  };
}
