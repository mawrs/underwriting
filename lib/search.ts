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

export const SEARCH_FIELDS: { id: SearchField; label: string }[] = [
  { id: "borrower", label: "Borrower" },
  { id: "loan-number", label: "Loan #" },
  { id: "cosigner", label: "Co-Signer" },
];

export function fileWorkspaceHref(app: Application) {
  const senior = app.status === "senior-review" || app.status === "approved";
  return senior ? `/senior-queue/${app.id}/opportunity` : `/applications/${app.id}/opportunity`;
}

export function loanTypeLabel(app: Application) {
  return app.recordType === "InSchool" ? "Student Loan InSchool" : "Student Loan Refi";
}

export function loanTypeFullLabel(app: Application) {
  return app.recordType === "InSchool" ? "In-School Student Loan" : "Student Loan Refinancing";
}

export function matchesBorrowerName(app: Application, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    app.borrower.fullName.toLowerCase().includes(needle) ||
    app.opportunityName.toLowerCase().includes(needle)
  );
}

export function borrowerNameOptions(apps: Application[]) {
  const seen = new Set<string>();
  return apps
    .flatMap((app) => {
      const name = app.borrower.fullName.trim();
      if (!name || seen.has(name)) return [];
      seen.add(name);
      return [{ id: name, label: name }];
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function matchesSearchQuery(app: Application, query: string, field: SearchField) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  if (field === "loan-number") return app.id.toLowerCase().includes(needle);
  if (field === "cosigner") return (app.cosigner?.fullName ?? "").toLowerCase().includes(needle);
  return matchesBorrowerName(app, needle);
}

export function searchFieldOptions(apps: Application[], field: SearchField) {
  if (field === "loan-number") {
    return [...apps]
      .map((app) => ({ id: app.id, label: app.id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  if (field === "cosigner") {
    const seen = new Set<string>();
    return apps
      .flatMap((app) => {
        const name = app.cosigner?.fullName.trim() ?? "";
        if (!name || seen.has(name)) return [];
        seen.add(name);
        return [{ id: name, label: name }];
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  return borrowerNameOptions(apps);
}

export function searchFieldAriaLabel(field: SearchField) {
  if (field === "loan-number") return "Search loan number";
  if (field === "cosigner") return "Search co-signer name";
  return "Search borrower name";
}
