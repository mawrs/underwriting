import type {
  Application,
  DebtTrade,
  DocumentKind,
  DocumentStatus,
  IncomeWorksheet,
  Liability,
  Notes,
  Person,
  UploadedDocument,
  WorkflowStatus,
} from "./types";
import { estimatedPayment } from "./calculations/income";
import { defaultLenderAddresses } from "./payoffs";

const PRIMARY_AMOUNT = 62494.9;

const emptyNotes = (): Notes => ({
  income: "",
  creditScore: "",
  degree: "",
  fico: "",
  documentation: "",
  payoff: "",
  general: "",
});

const defaultIncome = (overrides: Partial<IncomeWorksheet> = {}): IncomeWorksheet => ({
  selectedFrequency: "biweekly",
  grossPay: 0,
  hours: 40,
  payPeriods: 16,
  variableYtd: 0,
  variablePayPeriods: 0,
  priorYearIncome: 0,
  housingPayment: 0,
  estimatedNewPayment: 0,
  ...overrides,
});

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function doc(partial: {
  id: string;
  name: string;
  kind: DocumentKind;
  typeLabel: string;
  description: string;
  fileName: string;
  uploadedAt: string;
  sourceStatus?: string;
  reviewStatus?: DocumentStatus;
}): UploadedDocument {
  return {
    sourceStatus: "",
    reviewStatus: "pending",
    reviewedAt: null,
    note: "",
    ...partial,
  };
}

function liability(
  partial: Omit<
    Liability,
    "confirmed" | "selected" | "payoffType" | "adjLoanIdentifier" | "lenderAddresses" | "selectedAddress"
  > &
    Partial<Liability>,
): Liability {
  const addresses = partial.lenderAddresses ?? defaultLenderAddresses(partial.lender);
  return {
    selected: false,
    payoffType: "full",
    confirmed: false,
    adjLoanIdentifier: "",
    ...partial,
    lenderAddresses: addresses,
    selectedAddress: partial.selectedAddress ?? addresses[0] ?? "",
  };
}

function tradesFromLiabilities(items: Liability[]): DebtTrade[] {
  return items.map((item) => ({
    id: item.id,
    tradeType: item.category === "EDUCATIONAL" ? "Student Loan" : item.category,
    accountNumber: item.accountNumber,
    lender: item.lender,
    category: item.category,
    accountType: item.accountType,
    highCredit: item.highCredit,
    balance: item.balance,
    payment: item.payment,
    includeInDti: item.payment > 0,
  }));
}

const primaryLiabilities: Liability[] = [
  liability({
    id: "sm-1",
    lender: "SALLIE MAE",
    accountNumber: "6001842291766408",
    loanIdentifier: "6408",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 7600,
    balance: 6120,
    payment: 1,
    selected: true,
    adjCreditorName: "SALLIE MAE",
    adjAccountNumber: "6001842200842216",
    adjBalance: 6188.4,
    source: "sallie-mae",
  }),
  liability({
    id: "sm-2",
    lender: "SALLIE MAE",
    accountNumber: "6001842291764419",
    loanIdentifier: "4419",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 9100,
    balance: 8940,
    payment: 0,
    selected: true,
    adjCreditorName: "SALLIE MAE",
    adjAccountNumber: "6001842200843327",
    adjBalance: 9100,
    source: "sallie-mae",
  }),
  liability({
    id: "sm-3",
    lender: "SALLIE MAE",
    accountNumber: "6001842291763301",
    loanIdentifier: "3301",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 10400,
    balance: 10180,
    payment: 0,
    selected: true,
    adjCreditorName: "SALLIE MAE",
    adjAccountNumber: "6001842200844438",
    adjBalance: 10400,
    source: "sallie-mae",
  }),
  liability({
    id: "sm-4",
    lender: "SALLIE MAE",
    accountNumber: "6001842291762206",
    loanIdentifier: "2206",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 7900,
    balance: 7710,
    payment: 0,
    selected: true,
    adjCreditorName: "SALLIE MAE",
    adjAccountNumber: "6001842200845549",
    adjBalance: 7840,
    source: "sallie-mae",
  }),
  liability({
    id: "sm-5",
    lender: "SALLIE MAE",
    accountNumber: "6001842291761104",
    loanIdentifier: "1104",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 14200,
    balance: 13940,
    payment: 0,
    selected: true,
    adjCreditorName: "SALLIE MAE",
    adjAccountNumber: "6001842200846650",
    adjBalance: 14166.5,
    source: "sallie-mae",
  }),
  liability({
    id: "sm-6",
    lender: "SALLIE MAE",
    accountNumber: "6001842291760093",
    loanIdentifier: "0093",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 15000,
    balance: 14680,
    payment: 0,
    selected: true,
    adjCreditorName: "SALLIE MAE",
    adjAccountNumber: "6001842200847761",
    adjBalance: 14800,
    source: "sallie-mae",
  }),
  liability({
    id: "sa-1",
    lender: "LAKESHORE STUDENT AID",
    accountNumber: "9E88220190815550117",
    loanIdentifier: "0117",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 3400,
    balance: 3310,
    payment: 48,
    adjCreditorName: "LAKESHORE STUDENT AID",
    adjAccountNumber: "9E88220190815550117",
    adjBalance: 3310,
    source: "credit-report",
  }),
  liability({
    id: "sa-2",
    lender: "LAKESHORE STUDENT AID",
    accountNumber: "9E88220190815550228",
    loanIdentifier: "0228",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 8100,
    balance: 7980,
    payment: 61.2,
    adjCreditorName: "LAKESHORE STUDENT AID",
    adjAccountNumber: "9E88220190815550228",
    adjBalance: 7980,
    source: "credit-report",
  }),
  liability({
    id: "sa-3",
    lender: "LAKESHORE STUDENT AID",
    accountNumber: "9E88220190815550339",
    loanIdentifier: "0339",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 4300,
    balance: 4195,
    payment: 48,
    adjCreditorName: "LAKESHORE STUDENT AID",
    adjAccountNumber: "9E88220190815550339",
    adjBalance: 4195,
    source: "credit-report",
  }),
  liability({
    id: "cc-1",
    lender: "RIVERSTONE CARD",
    accountNumber: "600188447731",
    loanIdentifier: "7731",
    category: "CREDIT_CARD",
    accountType: "R",
    highCredit: 2800,
    balance: 1960,
    payment: 39,
    adjCreditorName: "RIVERSTONE CARD",
    adjAccountNumber: "600188447731",
    adjBalance: 1960,
    source: "credit-report",
  }),
  liability({
    id: "hl-1",
    lender: "HARBOR STUDENT LENDING",
    accountNumber: "8116623947",
    loanIdentifier: "3947",
    category: "EDUCATIONAL",
    accountType: "I",
    highCredit: 11800,
    balance: 10950,
    payment: 108,
    adjCreditorName: "HARBOR STUDENT LENDING",
    adjAccountNumber: "8116623947",
    adjBalance: 10950,
    source: "credit-report",
  }),
];

const elena: Application = {
  id: "2084417",
  opportunityName: "Elena Voss-2084417",
  recordType: "Tavant",
  stage: "UW - PreReview",
  amount: PRIMARY_AMOUNT,
  requestedTerm: 240,
  requestedRateType: "Fixed",
  applicationDate: "2026-08-20T20:39:00",
  hardCreditDate: "2026-08-16T08:12:00",
  preReviewAt: "2026-08-28T09:24:00",
  priority: 1,
  difficulty: "Medium",
  referrer: "Credible",
  underwriter: "Dana Whitfield",
  owner: "Nolan Keene",
  borrower: {
    fullName: "Elena Voss",
    email: "elena.voss@example.com",
    zip: "55113",
    state: "MN",
    filingStatus: "Single",
    birthDate: "1996-09-21",
    creditScore: 731,
    fico: 734,
    statedAnnualIncome: 68900,
    degree: "Bachelor of Science, Nursing",
    school: "Midwest State University",
  },
  cosigner: null,
  employment: [
    {
      employer: "Riverside Medical Center",
      title: "Registered Nurse",
      startDate: "2024-06-03",
      status: "Full-time",
      monthlyIncome: 5741.67,
    },
  ],
  documents: [
    doc({
      id: "d-id",
      name: "Identity Verification",
      kind: "identity",
      typeLabel: "Identification",
      description: "Identity Return",
      fileName: "Identity_Verification_V1.pdf",
      uploadedAt: "2026-08-20T20:39:00",
      sourceStatus: "Submitted",
    }),
    doc({
      id: "d-kyc",
      name: "KYC / CIP",
      kind: "kyc",
      typeLabel: "KYC",
      description: "Customer identification program",
      fileName: "KYC_CIP_2084417.pdf",
      uploadedAt: "2026-08-20T20:40:00",
      sourceStatus: "Submitted",
    }),
    doc({
      id: "d-cse",
      name: "Credit Score Exception Notice",
      kind: "credit-score-exception",
      typeLabel: "Credit Score Exception Notice",
      description: "Credit Score Exception Notice",
      fileName: "Credit_Score_Exception_Notice.pdf",
      uploadedAt: "2026-08-20T20:39:00",
    }),
    doc({
      id: "d-cr",
      name: "Credit Report",
      kind: "credit-report",
      typeLabel: "Credit Report",
      description: "Hard pull",
      fileName: "HardPullFile_718294.pdf",
      uploadedAt: "2026-08-20T20:39:00",
      sourceStatus: "Submitted",
    }),
    doc({
      id: "d-mla",
      name: "MLA Verification",
      kind: "mla",
      typeLabel: "MLA Verification",
      description: "Military Leave Act Return",
      fileName: "Equifax_MLA_Verification.pdf",
      uploadedAt: "2026-08-20T20:39:00",
    }),
    doc({
      id: "d-deg",
      name: "Degree / Transcript",
      kind: "degree",
      typeLabel: "Education",
      description: "Bachelor of Science, Nursing — Midwest State University",
      fileName: "Degree_Verification_MSU.pdf",
      uploadedAt: "2026-08-21T09:12:00",
      sourceStatus: "Submitted",
    }),
    doc({
      id: "d-ps1",
      name: "Pay Stub — Current",
      kind: "pay-stub",
      typeLabel: "Income",
      description: "Biweekly pay stub ending 08/15/2026",
      fileName: "Paystub_08152026.pdf",
      uploadedAt: "2026-08-21T09:14:00",
      sourceStatus: "Submitted",
    }),
    doc({
      id: "d-ps2",
      name: "Pay Stub — Prior",
      kind: "pay-stub",
      typeLabel: "Income",
      description: "Biweekly pay stub ending 08/01/2026",
      fileName: "Paystub_08012026.pdf",
      uploadedAt: "2026-08-21T09:14:00",
      sourceStatus: "Submitted",
    }),
  ],
  liabilities: primaryLiabilities,
  income: defaultIncome({
    selectedFrequency: "biweekly",
    grossPay: 2650,
    payPeriods: 16,
    housingPayment: 1380,
    estimatedNewPayment: round2(estimatedPayment(PRIMARY_AMOUNT, 240, 0.0839)),
    priorYearIncome: 66200,
  }),
  debtTrades: tradesFromLiabilities(primaryLiabilities),
  notes: emptyNotes(),
  status: "pre-review",
  decision: "",
  seniorNotes: "",
  seniorDecision: "",
  submittedAt: null,
  returnedAt: null,
  approvedAt: null,
  primarySnapshot: null,
  lastSavedAt: null,
  workbookFileName: null,
  workbookUploadedAt: null,
  workbookCopy: null,
};

const sampleCosigner: Person = {
  fullName: "Morgan Phelps",
  email: "morgan.phelps@example.com",
  zip: "30318",
  state: "GA",
  filingStatus: "Single",
  birthDate: "1974-11-18",
  creditScore: 752,
  fico: 755,
  statedAnnualIncome: 91200,
  degree: "Bachelor of Arts",
  school: "Northridge College",
};

function cloneLiabilitiesFor(id: string, amount: number): Liability[] {
  const scale = amount / PRIMARY_AMOUNT;
  const items = primaryLiabilities.map((item) => ({
    ...item,
    id: `${id}-${item.id}`,
    highCredit: round2(item.highCredit * scale),
    balance: round2(item.balance * scale),
    adjBalance: round2(item.adjBalance * scale),
    payment: round2(item.payment * scale),
    selected: item.source === "sallie-mae",
    confirmed: false,
  }));
  const selected = items.filter((item) => item.selected);
  const sum = selected.reduce((total, item) => total + item.adjBalance, 0);
  const last = selected[selected.length - 1];
  if (last) last.adjBalance = round2(last.adjBalance + (amount - sum));
  return items;
}

function lightApplication(input: {
  id: string;
  name: string;
  recordType: Application["recordType"];
  amount: number;
  priority: number;
  difficulty: Application["difficulty"];
  referrer: string;
  underwriter: string;
  owner: string;
  applicationDate: string;
  hardCreditDate: string;
  preReviewAt: string;
  status?: WorkflowStatus;
  email: string;
  state: string;
  hasCosigner?: boolean;
}): Application {
  const liabilities = cloneLiabilitiesFor(input.id, input.amount);

  return {
    ...elena,
    id: input.id,
    opportunityName: `${input.name}-${input.id}`,
    recordType: input.recordType,
    amount: input.amount,
    applicationDate: input.applicationDate,
    hardCreditDate: input.hardCreditDate,
    preReviewAt: input.preReviewAt,
    priority: input.priority,
    difficulty: input.difficulty,
    referrer: input.referrer,
    underwriter: input.underwriter,
    owner: input.owner,
    status: input.status ?? "pre-review",
    cosigner: input.hasCosigner ? sampleCosigner : null,
    borrower: {
      ...elena.borrower,
      fullName: input.name,
      email: input.email,
      state: input.state,
    },
    income: {
      ...elena.income,
      estimatedNewPayment: round2(estimatedPayment(input.amount, 240, 0.0839)),
    },
    liabilities,
    debtTrades: tradesFromLiabilities(liabilities),
    documents: elena.documents.map((item) => ({
      ...item,
      id: `${input.id}-${item.id}`,
      fileName: item.fileName.replace(elena.id, input.id),
      reviewStatus: "pending" as DocumentStatus,
      reviewedAt: null,
      note: "",
    })),
    notes: emptyNotes(),
    decision: "",
    seniorNotes: "",
    seniorDecision: "",
    submittedAt: null,
    returnedAt: null,
    approvedAt: null,
    primarySnapshot: null,
    lastSavedAt: null,
  };
}

export const seedApplications: Application[] = [
  elena,
  lightApplication({
    id: "2078834",
    name: "Mara Ellison",
    recordType: "InSchool",
    amount: 31800,
    priority: 2,
    difficulty: "Medium",
    referrer: "Splash",
    underwriter: "Miles Crowe",
    owner: "Ivy Tran",
    applicationDate: "2026-08-27T11:20:00",
    hardCreditDate: "2026-08-16T10:02:00",
    preReviewAt: "2026-08-28T09:10:00",
    email: "mara.ellison@example.com",
    state: "TX",
    hasCosigner: true,
  }),
  lightApplication({
    id: "2081902",
    name: "Theo Lang",
    recordType: "InSchool",
    amount: 44750,
    priority: 3,
    difficulty: "Hard",
    referrer: "Paid Search",
    underwriter: "Harper Quinn",
    owner: "Bennett Cole",
    applicationDate: "2026-08-26T16:40:00",
    hardCreditDate: "2026-08-18T09:00:00",
    preReviewAt: "2026-08-28T08:44:00",
    email: "theo.lang@example.com",
    state: "OH",
    hasCosigner: true,
  }),
  lightApplication({
    id: "2076510",
    name: "Anika Bose",
    recordType: "InSchool",
    amount: 151200,
    priority: 1,
    difficulty: "Hard",
    referrer: "NerdWallet",
    underwriter: "Ravi Mehra",
    owner: "Reese Alvarez",
    applicationDate: "2026-08-25T14:12:00",
    hardCreditDate: "2026-08-15T13:22:00",
    preReviewAt: "2026-08-28T08:12:00",
    email: "anika.bose@example.com",
    state: "CA",
    hasCosigner: true,
  }),
  lightApplication({
    id: "2075208",
    name: "Felix Grant",
    recordType: "InSchool",
    amount: 5200,
    priority: 6,
    difficulty: "Medium",
    referrer: "Credible",
    underwriter: "June Calder",
    owner: "Nolan Keene",
    applicationDate: "2026-08-27T09:05:00",
    hardCreditDate: "2026-08-20T11:48:00",
    preReviewAt: "2026-08-28T07:55:00",
    email: "felix.grant@example.com",
    state: "FL",
    hasCosigner: true,
  }),
  lightApplication({
    id: "2087743",
    name: "Nadia Okoye",
    recordType: "Tavant",
    amount: 49800,
    priority: 2,
    difficulty: "Medium",
    referrer: "Splash",
    underwriter: "Owen Briggs",
    owner: "Ivy Tran",
    applicationDate: "2026-08-24T18:30:00",
    hardCreditDate: "2026-08-19T08:16:00",
    preReviewAt: "2026-08-28T07:40:00",
    email: "nadia.okoye@example.com",
    state: "GA",
  }),
  lightApplication({
    id: "2080199",
    name: "Mateo Ruiz",
    recordType: "Tavant",
    amount: 81200,
    priority: 4,
    difficulty: "Hard",
    referrer: "Paid Search",
    underwriter: "Sasha Lind",
    owner: "Bennett Cole",
    applicationDate: "2026-08-23T12:08:00",
    hardCreditDate: "2026-08-17T15:41:00",
    preReviewAt: "2026-08-28T07:22:00",
    email: "mateo.ruiz@example.com",
    state: "AZ",
  }),
  lightApplication({
    id: "2073381",
    name: "Claire Brennan",
    recordType: "Tavant",
    amount: 36150,
    priority: 5,
    difficulty: "Medium",
    referrer: "NerdWallet",
    underwriter: "Dana Whitfield",
    owner: "Reese Alvarez",
    applicationDate: "2026-08-22T10:17:00",
    hardCreditDate: "2026-08-14T09:55:00",
    preReviewAt: "2026-08-27T16:05:00",
    email: "claire.brennan@example.com",
    state: "CO",
  }),
];
