import type { WorkflowStatus } from "./types";

export const QUEUE_VIEWS = [
  {
    id: "supervisor-approval",
    label: "Supervisor Approval",
    lede: "Files approved at second level and waiting on supervisor sign-off.",
    empty: "No files in supervisor approval.",
    statuses: ["approved"] as WorkflowStatus[],
    hrefFor: "senior" as const,
  },
  {
    id: "pre-review",
    label: "ReFi&InSchool UW PreReview Master Queue",
    lede: "Files ready for credit review. Open the next application to start document and payoff work.",
    empty: "No files in the pre-review queue.",
    statuses: ["pre-review", "needs-docs", "returned"] as WorkflowStatus[],
    hrefFor: "primary" as const,
  },
  {
    id: "final-review",
    label: "Underwriting Final Review Queue",
    lede: "Files submitted for independent review. Primary underwriting is pre-filled.",
    empty: "No files waiting for final review.",
    statuses: ["senior-review"] as WorkflowStatus[],
    hrefFor: "senior" as const,
  },
  {
    id: "on-hold",
    label: "ReFi Supervisor on Hold",
    lede: "Files held for documentation or returned from senior review.",
    empty: "No files on hold.",
    statuses: ["needs-docs", "returned"] as WorkflowStatus[],
    hrefFor: "primary" as const,
  },
] as const;

export type QueueViewId = (typeof QUEUE_VIEWS)[number]["id"];

export function queueView(id: string | undefined) {
  return QUEUE_VIEWS.find((view) => view.id === id) ?? QUEUE_VIEWS[1];
}
