// types/index.ts — Tipos centrais do FinControle

export type TransactionType = "in" | "out";
export type TransactionStatus = "previsto" | "realizado";

export interface Transaction {
  id: string;
  userId: string;
  desc: string;
  amount: number;
  type: TransactionType;
  cat: string;
  date: string; // YYYY-MM-DD
  done: boolean;
  seriesId?: string;      // ID do grupo de parcelas
  seriesIndex?: number;   // posição (1-based)
  seriesTotal?: number;   // total de parcelas
  createdAt: number;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;    // lançado manualmente
  monthlyContribution: number;
  deadline?: string;        // YYYY-MM
  type: "emergency" | "goal";
  status: "active" | "achieved" | "paused";
  createdAt: number;
  updatedAt: number;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  createdAt: number;
  settings: {
    theme: "light" | "dark" | "system";
    defaultCategories?: string[];
  };
  // Futuro: interligação de usuários (deixado anotado)
  // sharedWith?: string[];
}

export interface MonthSummary {
  month: string; // YYYY-MM
  totalIn: number;
  totalOut: number;
  realizedIn: number;
  realizedOut: number;
  balance: number;
  realizedBalance: number;
}

export const INCOME_CATEGORIES = [
  "Salário",
  "Auxílio-transporte",
  "Freelance",
  "13º Salário",
  "Bolsa de Estágio",
  "Outros ganhos",
] as const;

export const EXPENSE_CATEGORIES = [
  "Moradia & Habitação",
  "Alimentação",
  "Transporte",
  "Educação",
  "Saúde",
  "Lazer & Cultura",
  "Cartão de crédito",
  "Assinaturas",
  "Dívidas",
  "Viagem",
  "Contas Fixas",
  "Fundo de emergência",
  "Meta pessoal",
  "Outros gastos",
] as const;
