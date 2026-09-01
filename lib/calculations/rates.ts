import { estimatedPayment, monthlyIncome } from "./income";
import type { Application } from "../types";

export const RATE_TERMS = [60, 84, 120, 180, 240] as const;
export type RateTerm = (typeof RATE_TERMS)[number];
export type RateKind = "Fixed" | "Variable";

const FIXED_RATES: Record<RateTerm, number | null> = {
  60: null,
  84: null,
  120: 0.0834,
  180: 0.0834,
  240: 0.0839,
};

const VARIABLE_RATES: Record<RateTerm, number | null> = {
  60: null,
  84: null,
  120: 0.0786,
  180: 0.0806,
  240: 0.0802,
};

const VARIABLE_MARGIN: Record<RateTerm, number | null> = {
  60: null,
  84: null,
  120: 0.0111,
  180: 0.0131,
  240: 0.0127,
};

export function rateFor(kind: RateKind, term: RateTerm) {
  return kind === "Fixed" ? FIXED_RATES[term] : VARIABLE_RATES[term];
}

export function marginFor(term: RateTerm) {
  return VARIABLE_MARGIN[term];
}

export function paymentFor(application: Application, kind: RateKind, term: RateTerm) {
  const rate = rateFor(kind, term);
  if (rate == null) return null;
  return Math.round(estimatedPayment(application.amount, term, rate) * 100) / 100;
}

export function dtiForPayment(application: Application, payment: number | null) {
  if (payment == null) return null;
  const income = monthlyIncome(application.income).total;
  if (!income) return null;
  const paidOffIds = new Set(
    application.liabilities.filter((item) => item.selected).map((item) => item.id),
  );
  const remaining = application.debtTrades
    .filter((trade) => trade.includeInDti && !paidOffIds.has(trade.id))
    .reduce((sum, trade) => sum + (trade.payment || 0), 0);
  return (remaining + (application.income.housingPayment || 0) + payment) / income;
}
