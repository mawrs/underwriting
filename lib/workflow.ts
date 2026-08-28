import { calculate } from "./calculations";
import { money, percent } from "./format";
import type { Application } from "./types";
import { submissionChecklist } from "./validation";

export const WORKFLOW_STEPS = [
  { slug: "documents", label: "Documents", hint: "Cross-check uploads" },
  { slug: "income", label: "Income", hint: "Stated against verified" },
  { slug: "payoffs", label: "Loan payoffs", hint: "Payoffs and Sallie Mae" },
  { slug: "dti", label: "Debt and DTI", hint: "Borrower debt calculation" },
  { slug: "notes", label: "Official notes", hint: "Observations for the file" },
  { slug: "submit", label: "Review and submit", hint: "Decision, package, handoff" },
] as const;

export type WorkflowSlug = (typeof WORKFLOW_STEPS)[number]["slug"];

export type FlagTone = "good" | "warn" | "bad";

export interface StepFlag {
  tone: FlagTone;
  text: string;
}

export function isWorkflowSlug(value: string): value is WorkflowSlug {
  return WORKFLOW_STEPS.some((step) => step.slug === value);
}

export function workflowSlugFromPath(pathname: string): WorkflowSlug {
  const slug = pathname.split("/").filter(Boolean).at(-1) ?? "";
  return isWorkflowSlug(slug) ? slug : "documents";
}

export function stepIndex(slug: WorkflowSlug): number {
  return WORKFLOW_STEPS.findIndex((step) => step.slug === slug);
}

export function stepDone(application: Application, slug: WorkflowSlug): boolean {
  const items = Object.fromEntries(
    submissionChecklist(application).map((item) => [item.id, item.done]),
  );
  const calc = calculate(application);

  switch (slug) {
    case "documents":
      return Boolean(items.docs);
    case "income":
      return Boolean(items.income);
    case "payoffs":
      return Boolean(items.payoffs);
    case "dti":
      return calc.dti != null && calc.dti > 0;
    case "notes":
      return Boolean(items["notes-income"] && items["notes-credit"] && items["notes-degree"]);
    case "submit":
      return (
        application.status === "senior-review" ||
        application.status === "approved" ||
        Boolean(items.decision)
      );
  }
}

export function incomeVariance(application: Application): number | null {
  const stated = application.borrower.statedAnnualIncome;
  const verified = calculate(application).annualizedIncome;
  if (!stated || !verified) return null;
  return (verified - stated) / stated;
}

export function stepFlags(application: Application, slug: WorkflowSlug): StepFlag[] {
  const calc = calculate(application);
  const items = submissionChecklist(application);

  if (slug === "documents") {
    const blocked = items.find((item) => item.id === "blocked-docs");
    const docs = items.find((item) => item.id === "docs");
    if (docs?.done && blocked?.done) {
      return [{ tone: "good", text: "Required documents have been reviewed." }];
    }
    if (!docs?.done) {
      return [
        {
          tone: "warn",
          text: "Required documents are still unreviewed. Income and payoff figures stay unconfirmed until they are.",
        },
      ];
    }
    return [
      {
        tone: "warn",
        text: "A required document is incomplete or rejected. Set needs documentation, or resolve it before submit.",
      },
    ];
  }

  if (slug === "income") {
    const flags: StepFlag[] = [];
    if (!items.find((item) => item.id === "docs")?.done) {
      flags.push({
        tone: "warn",
        text: "Required documents are not all reviewed, so this income is still unconfirmed.",
      });
    }
    const variance = incomeVariance(application);
    if (variance != null && Math.abs(variance) > 0.1) {
      flags.push({
        tone: "warn",
        text: `Verified income is ${percent(Math.abs(variance))} ${variance < 0 ? "below" : "above"} stated, over the 10% tolerance. Note this before submitting.`,
      });
    } else if (calc.monthlyIncome > 0) {
      flags.push({ tone: "good", text: "Verified income is within tolerance of stated." });
    }
    return flags;
  }

  if (slug === "payoffs") {
    if (calc.selectedCount === 0) {
      return [{ tone: "warn", text: "No loans are selected for payoff." }];
    }
    if (calc.discrepancyCount > 0) {
      return [
        {
          tone: "warn",
          text: `${calc.discrepancyCount} selected payoff${calc.discrepancyCount === 1 ? "" : "s"} differ from the source document. Confirm before submitting.`,
        },
      ];
    }
    return [{ tone: "good", text: "Selected payoffs match the source documents." }];
  }

  if (slug === "dti") {
    if (calc.dti == null) {
      return [{ tone: "warn", text: "DTI cannot be calculated until monthly income is entered." }];
    }
    if (calc.dti > 0.45) {
      return [
        {
          tone: "bad",
          text: `DTI is ${percent(calc.dti)}, over the 45% policy maximum. This is a counter-offer or a decline.`,
        },
      ];
    }
    if (calc.dti > 0.4) {
      return [
        {
          tone: "warn",
          text: `DTI is ${percent(calc.dti)}, under the maximum with limited room. Call this out in the notes.`,
        },
      ];
    }
    return [{ tone: "good", text: `DTI is ${percent(calc.dti)}, inside the 45% maximum.` }];
  }

  return [];
}

export function packageLines(application: Application): [string, string][] {
  const calc = calculate(application);
  const notesFilled = Object.values(application.notes).filter((value) => value.trim()).length;
  const verifiedDocs = application.documents.filter((doc) => doc.reviewStatus === "approved").length;

  return [
    ["Documents reviewed", `${verifiedDocs} of ${application.documents.length} approved`],
    ["Verified monthly income", money(calc.monthlyIncome)],
    ["Selected payoff total", money(calc.selectedPayoffTotal)],
    ["New monthly payment", money(calc.estimatedNewPayment)],
    ["Remaining monthly debt", money(calc.remainingMonthlyDebt)],
    ["Borrower monthly debt", money(calc.qualifyingMonthlyDebt)],
    ["DTI", percent(calc.dti)],
    ["FICO", String(application.borrower.fico || "—")],
    ["Official notes", `${notesFilled} of 7`],
  ];
}

export function requiredDocument(kind: Application["documents"][number]["kind"]): boolean {
  return ["identity", "kyc", "credit-report", "degree", "pay-stub"].includes(kind);
}
