// lib/utils.ts
export function brl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function ym(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function todayStr(): string {
  const d = new Date();
  return `${ym(d)}-${pad(d.getDate())}`;
}

export function shiftMonth(m: string, n: number): string {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo - 1 + n, 1);
  return ym(d);
}

export function monthLabel(m: string, options?: Intl.DateTimeFormatOptions): string {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString("pt-BR", options ?? { month: "long", year: "numeric" });
}

export function monthShort(m: string): string {
  return monthLabel(m, { month: "short" }).replace(".", "");
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function pct(val: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((val / total) * 1000) / 10);
}

export function parseBRL(raw: string): number {
  return parseFloat(raw.replace(/\./g, "").replace(",", ".")) || 0;
}

export function getLast6Months(currentMonth: string): string[] {
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) months.push(shiftMonth(currentMonth, -i));
  return months;
}

export function get13Months(startMonth: string): string[] {
  const months: string[] = [];
  for (let i = 0; i < 13; i++) months.push(shiftMonth(startMonth, i));
  return months;
}
