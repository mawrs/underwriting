import type { DocumentStatus, WorkflowStatus } from "@/lib/types";

const statusClass: Record<string, string> = {
  "pre-review": "bg-warning-bg text-charcoal border-warning",
  "needs-docs": "bg-warning-bg text-charcoal border-warning",
  "senior-review": "bg-navy-bg text-navy border-navy",
  returned: "bg-orange-bg text-orange-hover border-orange",
  approved: "bg-success-bg text-success-hover border-success",
  pending: "bg-white text-charcoal border-charcoal",
  submitted: "bg-warning-bg text-charcoal border-warning",
  rejected: "bg-error-bg text-error-hover border-error",
  incomplete: "bg-error-bg text-error-hover border-error",
  Medium: "bg-white text-charcoal border-charcoal",
  Hard: "bg-error-bg text-error-hover border-error",
  InSchool: "bg-primary-bg-dev text-primary border-primary",
  Tavant: "bg-navy-bg text-navy border-navy",
};

export function StatusBadge({
  value,
}: {
  value: WorkflowStatus | DocumentStatus | string;
}) {
  const className = statusClass[value] ?? statusClass.pending;
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-[13px] py-[5px] text-xs font-normal capitalize ${className}`}
    >
      {value.replace(/-/g, " ")}
    </span>
  );
}
