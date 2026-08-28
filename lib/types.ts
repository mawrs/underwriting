export type RecordType = "InSchool" | "Tavant";
export type Difficulty = "Medium" | "Hard";
export type Role = "underwriter" | "senior";

export type WorkflowStatus =
  | "pre-review"
  | "needs-docs"
  | "senior-review"
  | "returned"
  | "approved";

export type DocumentKind =
  | "identity"
  | "kyc"
  | "credit-report"
  | "credit-score-exception"
  | "mla"
  | "degree"
  | "pay-stub";

export type DocumentStatus =
  | "pending"
  | "submitted"
  | "approved"
  | "rejected"
  | "incomplete";

export type PayoffType = "full" | "partial";
export type AccountType = "I" | "R";

export type IncomeFrequency =
  | "annual"
  | "monthly"
  | "semi-monthly"
  | "biweekly"
  | "weekly"
  | "hourly"
  | "ytd";

export type Decision =
  | ""
  | "approve"
  | "counter-offer"
  | "deny"
  | "needs-docs"
  | "return-to-uw";

export interface Person {
  fullName: string;
  email: string;
  zip: string;
  state: string;
  filingStatus: string;
  birthDate: string;
  creditScore: number;
  fico: number;
  statedAnnualIncome: number;
  degree: string;
  school: string;
}

export interface Employment {
  employer: string;
  title: string;
  startDate: string;
  status: string;
  monthlyIncome: number;
}

export interface UploadedDocument {
  id: string;
  name: string;
  kind: DocumentKind;
  typeLabel: string;
  description: string;
  fileName: string;
  uploadedAt: string;
  sourceStatus: string;
  reviewStatus: DocumentStatus;
  reviewedAt: string | null;
  note: string;
}

export interface Liability {
  id: string;
  lender: string;
  accountNumber: string;
  loanIdentifier: string;
  category: string;
  accountType: AccountType;
  highCredit: number;
  balance: number;
  payment: number;
  selected: boolean;
  payoffType: PayoffType;
  adjCreditorName: string;
  adjAccountNumber: string;
  adjBalance: number;
  source: "credit-report" | "sallie-mae" | "manual";
  confirmed: boolean;
}

export interface IncomeWorksheet {
  selectedFrequency: IncomeFrequency;
  grossPay: number;
  hours: number;
  payPeriods: number;
  variableYtd: number;
  variablePayPeriods: number;
  priorYearIncome: number;
  housingPayment: number;
  estimatedNewPayment: number;
}

export interface DebtTrade {
  id: string;
  tradeType: string;
  accountNumber: string;
  lender: string;
  category: string;
  accountType: AccountType;
  highCredit: number;
  balance: number;
  payment: number;
  includeInDti: boolean;
}

export interface Notes {
  income: string;
  creditScore: string;
  degree: string;
  fico: string;
  documentation: string;
  payoff: string;
  general: string;
}

export interface CalculationResult {
  monthlyBaseIncome: number;
  monthlyVariableIncome: number;
  monthlyIncome: number;
  annualizedIncome: number;
  selectedPayoffTotal: number;
  remainingMonthlyDebt: number;
  housingPayment: number;
  borrowerDebt: number;
  estimatedNewPayment: number;
  qualifyingMonthlyDebt: number;
  dti: number | null;
  selectedCount: number;
  discrepancyCount: number;
}

export interface PrimarySnapshot {
  submittedAt: string;
  submittedBy: string;
  documents: UploadedDocument[];
  liabilities: Liability[];
  income: IncomeWorksheet;
  debtTrades: DebtTrade[];
  notes: Notes;
  decision: Decision;
  calculations: CalculationResult;
}

export interface Application {
  id: string;
  opportunityName: string;
  recordType: RecordType;
  stage: string;
  amount: number;
  requestedTerm: number;
  requestedRateType: "Fixed" | "Variable";
  applicationDate: string;
  hardCreditDate: string;
  preReviewAt: string;
  priority: number;
  difficulty: Difficulty;
  referrer: string;
  underwriter: string;
  owner: string;
  borrower: Person;
  cosigner: Person | null;
  employment: Employment[];
  documents: UploadedDocument[];
  liabilities: Liability[];
  income: IncomeWorksheet;
  debtTrades: DebtTrade[];
  notes: Notes;
  status: WorkflowStatus;
  decision: Decision;
  seniorNotes: string;
  seniorDecision: Decision;
  submittedAt: string | null;
  returnedAt: string | null;
  approvedAt: string | null;
  primarySnapshot: PrimarySnapshot | null;
  lastSavedAt: string | null;
}

export type ApplicationPatch = Partial<
  Pick<
    Application,
    | "documents"
    | "liabilities"
    | "income"
    | "debtTrades"
    | "notes"
    | "decision"
    | "seniorNotes"
    | "seniorDecision"
    | "status"
    | "borrower"
  >
>;
