// lib/hooks/useGoals.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Goal } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "goals"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Goal))
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setGoals(list);
        setLoading(false);
      },
      (error) => {
        console.warn("Aviso ao buscar metas no Firestore:", error.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [user]);

  const addGoal = useCallback(
    async (data: Omit<Goal, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!user) return;
      await addDoc(collection(db, "goals"), {
        ...data,
        userId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },
    [user]
  );

  const updateGoal = useCallback(async (id: string, data: Partial<Goal>) => {
    await updateDoc(doc(db, "goals", id), { ...data, updatedAt: Date.now() });
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "goals", id));
  }, []);

  const addContribution = useCallback(
    async (goalId: string, amount: number) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;
      await updateDoc(doc(db, "goals", goalId), {
        currentAmount: goal.currentAmount + amount,
        updatedAt: Date.now(),
        status: goal.currentAmount + amount >= goal.targetAmount ? "achieved" : "active",
      });
    },
    [goals]
  );

  return { goals, loading, addGoal, updateGoal, deleteGoal, addContribution };
}
