"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { TransactionModal } from "@/components/TransactionModal";
import { useTransactions } from "@/lib/hooks/useTransactions";
import {
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function AjudaPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addTransaction, addSeries } = useTransactions();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <span className="text-sm" style={{ color: "var(--muted)" }}>Carregando…</span>
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  const faqs = [
    {
      q: "Qual é a diferença entre Previsto e Realizado?",
      a: "No FinControle, estimativa não é valor recebido. Valores futuros ou não confirmados devem permanecer como 'Previsto'. Apenas marque como 'Realizado' (pago/recebido) quando o dinheiro efetivamente entrar na conta ou o pagamento for liquidado. Isso garante que o saldo livre exibido reflita fielmente sua saúde financeira.",
    },
    {
      q: "Por que o Fundo de Emergência e a Meta Principal são sempre separados?",
      a: "Essa é a Regra de Ouro do sistema: o Fundo de Emergência serve exclusivamente para cobrir imprevistos e garantir tranquilidade (recomenda-se de 3 a 6 meses de custos fixos essenciais em aplicações de liquidez imediata). As metas específicas (viagens, compras, cursos) possuem cronogramas e propósitos próprios. Misturar os dois compromete sua segurança em caso de emergência.",
    },
    {
      q: "Como funcionam as parcelas e repetições?",
      a: "Ao cadastrar uma despesa ou receita recorrente (ex.: compra parcelada em 10x ou assinatura), defina o número de repetições. O sistema cria os lançamentos mês a mês e associa um identificador de série. Ao editar ou excluir uma parcela, você pode escolher se deseja alterar apenas aquela parcela, todas as parcelas futuras ou toda a série.",
    },
    {
      q: "Como funciona a Visão de 13 Meses?",
      a: "A visão de 13 meses permite projetar receitas, despesas e reservas por um ano completo mais um mês adicional (ciclo expandido). Isso facilita o planejamento de despesas sazonais (como IPVA, IPTU, matrículas) e garante que o acúmulo de reservas seja sustentável ao longo do tempo.",
    },
    {
      q: "Onde meus dados ficam armazenados?",
      a: "Diferente da versão anterior que armazenava os dados apenas no navegador (localStorage), o FinControle profissional armazena seus dados no Google Cloud Firestore com autenticação segura. Cada usuário tem acesso exclusivo aos seus próprios registros criptografados.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <Navbar onOpenNewTx={() => setIsTxModalOpen(true)} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>
              Manual do Sistema
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            <span className="text-xs" style={{ color: "var(--muted)" }}>Diretrizes e Boas Práticas Contábeis</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Ajuda &amp; Guia Metodológico</h1>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            Aprenda a tirar o máximo proveito do FinControle e manter seu patrimônio protegido.
          </p>
        </div>

        {/* 3 Pilares da Metodologia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="rounded-xl p-5 border shadow-sm space-y-2"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--gain)" }}>
              <CheckCircle2 size={18} />
              <span>1. Segregação Absoluta</span>
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Salário, auxílio-transporte, despesas operacionais e reservas têm destinos próprios e nunca são misturados.
            </p>
          </div>

          <div
            className="rounded-xl p-5 border shadow-sm space-y-2"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--accent)" }}>
              <ShieldCheck size={18} />
              <span>2. Regra do Fundo Blindado</span>
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              O fundo de emergência não financia metas de consumo ou lazer. Ele protege seu padrão de vida contra imprevistos.
            </p>
          </div>

          <div
            className="rounded-xl p-5 border shadow-sm space-y-2"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--pending)" }}>
              <Sparkles size={18} />
              <span>3. Rigor com Estimativas</span>
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Estimativa não é dinheiro em conta. Só considere um valor realizado quando houver compensação bancária.
            </p>
          </div>
        </div>

        {/* FAQ em Acordeon */}
        <section
          className="rounded-xl p-5 border shadow-sm space-y-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-bold">Perguntas Frequentes (FAQ)</h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border overflow-hidden transition-colors"
                  style={{ background: "var(--subtle)", borderColor: "var(--border)" }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 font-semibold text-xs flex items-center justify-between gap-3"
                    style={{ color: "var(--text)" }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      style={{ color: "var(--muted)" }}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs leading-relaxed border-t" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSaveSingle={addTransaction}
        onSaveSeries={addSeries}
      />
    </div>
  );
}
