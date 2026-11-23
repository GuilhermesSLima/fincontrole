"use client";

import { useState, useEffect } from "react";
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
  const { addTransaction } = useTransactions();
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
          <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
            Carregando Ajuda…
          </span>
        </div>
      </div>
    );
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

      <main className="fc-container space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>
              Manual do Sistema
            </span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--border-hover)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Diretrizes e Boas Práticas Contábeis
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--text)" }}>
            Ajuda &amp; Guia Metodológico
          </h1>
          <p className="text-xs sm:text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Aprenda a tirar o máximo proveito do FinControle e manter seu patrimônio protegido.
          </p>
        </div>

        {/* 3 Pilares da Metodologia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="fc-card space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--gain)" }}>
              <CheckCircle2 size={18} />
              <span>1. Segregação Absoluta</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Salário, auxílio-transporte, despesas operacionais e reservas têm destinos próprios e nunca são misturados.
            </p>
          </div>

          <div className="fc-card space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--accent)" }}>
              <ShieldCheck size={18} />
              <span>2. Fundo Intocável</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              A reserva de emergência tem prioridade máxima e deve ser preservada contra gastos supérfluos.
            </p>
          </div>

          <div className="fc-card space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--pending)" }}>
              <Sparkles size={18} />
              <span>3. Rigor nos Status</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Só considere dinheiro como real quando ele for efetivamente liquidado no extrato bancário.
            </p>
          </div>
        </div>

        {/* Perguntas Frequentes Accordion */}
        <div className="fc-card space-y-4">
          <div className="fc-card-header">
            <h2 className="fc-card-title">
              <BookOpen size={18} style={{ color: "var(--accent)" }} />
              <span>Perguntas Frequentes (FAQ)</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border overflow-hidden transition-all"
                  style={{
                    background: "var(--surface)",
                    borderColor: isOpen ? "var(--accent)" : "var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 flex items-center justify-between font-bold text-sm transition-colors"
                    style={{ color: "var(--text)" }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      style={{ color: "var(--text-muted)" }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      className="px-4 pb-4 pt-1 text-xs leading-relaxed border-t"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-muted)",
                        background: "var(--subtle)",
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal de Transação */}
      {isTxModalOpen && (
        <TransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          onSubmit={async (data) => {
            await addTransaction(data);
          }}
        />
      )}
    </div>
  );
}
