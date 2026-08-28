import type { IncomeFrequency, IncomeWorksheet } from "../types";

export function monthlyFromFrequency(
  frequency: IncomeFrequency,
  grossPay: number,
  hours = 0,
  payPeriods = 0,
): number {
  if (!grossPay) return 0;

  switch (frequency) {
    case "annual":
      return grossPay / 12;
    case "monthly":
      return grossPay;
    case "semi-monthly":
      return (grossPay * 24) / 12;
    case "biweekly":
      return (grossPay * 26) / 12;
    case "weekly":
      return (grossPay * 52) / 12;
    case "hourly":
      return (grossPay * hours * 52) / 12;
    case "ytd":
      if (!payPeriods) return 0;
      return ((grossPay / payPeriods) * 26) / 12;
    default:
      return 0;
  }
}

export function monthlyIncome(income: IncomeWorksheet): {
  base: number;
  variable: number;
  total: number;
  annualized: number;
} {
  const base = monthlyFromFrequency(
    income.selectedFrequency,
    income.grossPay,
    income.hours,
    income.payPeriods,
  );
  const variable = income.variablePayPeriods
    ? income.variableYtd / income.variablePayPeriods
    : 0;
  const total = base + variable;
  return { base, variable, total, annualized: total * 12 };
}

export function estimatedPayment(
  amount: number,
  termMonths: number,
  annualRate = 0.075,
): number {
  if (!amount || !termMonths) return 0;
  const r = annualRate / 12;
  if (r === 0) return amount / termMonths;
  return (amount * r) / (1 - Math.pow(1 + r, -termMonths));
}
