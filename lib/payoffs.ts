import type { Liability } from "./types";

const LENDER_ADDRESSES: Record<string, string[]> = {
  "SALLIE MAE": ["PO Box 8459 Philadelphia, Pennsylvania 19101"],
  "LAKESHORE STUDENT AID": ["PO Box 2100 Chicago, Illinois 60690"],
  "HARBOR STUDENT LENDING": ["PO Box 4412 Boston, Massachusetts 02101"],
};

export function isStudentLoan(item: Liability) {
  return item.category === "EDUCATIONAL";
}

export function defaultLenderAddresses(lender: string) {
  return LENDER_ADDRESSES[lender.trim().toUpperCase()] ?? [];
}

export function normalizeLiability(item: Liability): Liability {
  const addresses =
    item.lenderAddresses?.length > 0 ? item.lenderAddresses : defaultLenderAddresses(item.lender);
  return {
    ...item,
    adjLoanIdentifier: item.adjLoanIdentifier ?? "",
    lenderAddresses: addresses,
    selectedAddress: item.selectedAddress || addresses[0] || "",
  };
}

export function emptyStudentLoan(): Liability {
  return {
    id: `manual-${Date.now()}`,
    lender: "",
    accountNumber: "",
    loanIdentifier: "",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 0,
    balance: 0,
    payment: 0,
    selected: true,
    payoffType: "full",
    adjCreditorName: "",
    adjAccountNumber: "",
    adjLoanIdentifier: "",
    adjBalance: 0,
    source: "manual",
    confirmed: false,
    lenderAddresses: [],
    selectedAddress: "",
  };
}
