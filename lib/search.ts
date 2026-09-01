import type { Application, WorkflowStatus } from "./types";

export const BORROWER_STATUS_LABEL: Record<WorkflowStatus, string> = {
  "pre-review": "UW Pre-Review",
  "needs-docs": "Needs Documentation",
  "senior-review": "Senior Review",
  returned: "Returned to UW",
  approved: "Approved",
};

export type SearchField = "loan-number" | "borrower" | "cosigner";
export type CosignerFilter = "all" | "has" | "none";
export type CategoryFilter = "all" | "InSchool" | "Tavant";

export function fileWorkspaceHref(app: Application) {
  const senior = app.status === "senior-review" || app.status === "approved";
  return senior ? `/senior-queue/${app.id}/review` : `/applications/${app.id}/review`;
}

export function loanTypeLabel(app: Application) {
  return app.recordType === "InSchool" ? "In-School" : "Student Loan Refi";
}

export function loanTypeFullLabel(app: Application) {
  return app.recordType === "InSchool" ? "In-School Student Loan" : "Student Loan Refinancing";
}
