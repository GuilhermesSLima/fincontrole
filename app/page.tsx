"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) router.replace("/dashboard");
      else router.replace("/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="text-center">
        <div className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          FinControle
        </div>
        <div className="mt-2 text-sm" style={{ color: "var(--muted)" }}>Carregando…</div>
      </div>
    </div>
  );
}
