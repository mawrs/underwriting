"use client";

import { BORROWER_STATUS_LABEL, type CategoryFilter, type CosignerFilter } from "@/lib/search";
import type { WorkflowStatus } from "@/lib/types";

export type FilterChip = {
  id: string;
  label: string;
  onClear: () => void;
};

export type ListFilterValues = {
  query: string;
  category: CategoryFilter;
  borrowerStatus: "all" | WorkflowStatus;
  cosigner: CosignerFilter;
  fromDate?: string;
  toDate?: string;
};

export function listFilterChips(
  values: ListFilterValues,
  onClear: {
    query: () => void;
    category: () => void;
    borrowerStatus: () => void;
    cosigner: () => void;
    fromDate?: () => void;
    toDate?: () => void;
  },
): FilterChip[] {
  const chips: FilterChip[] = [];
  const query = values.query.trim();
  if (query) chips.push({ id: "query", label: query, onClear: onClear.query });
  if (values.category !== "all") {
    chips.push({
      id: "category",
      label: values.category === "InSchool" ? "In-School" : "Student Loan Refi",
      onClear: onClear.category,
    });
  }
  if (values.borrowerStatus !== "all") {
    chips.push({
      id: "status",
      label: BORROWER_STATUS_LABEL[values.borrowerStatus],
      onClear: onClear.borrowerStatus,
    });
  }
  if (values.cosigner !== "all") {
    chips.push({
      id: "cosigner",
      label: values.cosigner === "has" ? "Has co-signer" : "No co-signer",
      onClear: onClear.cosigner,
    });
  }
  if (values.fromDate && onClear.fromDate) {
    chips.push({ id: "fromDate", label: `From ${formatChipDate(values.fromDate)}`, onClear: onClear.fromDate });
  }
  if (values.toDate && onClear.toDate) {
    chips.push({ id: "toDate", label: `To ${formatChipDate(values.toDate)}`, onClear: onClear.toDate });
  }
  return chips;
}

export function FilterBadges({ chips, onClearAll }: { chips: FilterChip[]; onClearAll: () => void }) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-sm">
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex h-8 max-w-full items-center gap-xs rounded-full border border-gray-light bg-primary-bg pl-md pr-sm text-sm text-charcoal"
        >
          <span className="min-w-0 truncate">{chip.label}</span>
          <button
            type="button"
            aria-label={`Clear ${chip.label}`}
            onClick={chip.onClear}
            className="flex size-5 shrink-0 items-center justify-center rounded-full text-gray-dark hover:bg-white hover:text-charcoal"
          >
            <CloseIcon />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="uw-btn-link h-8 px-xs"
      >
        Clear All
      </button>
    </div>
  );
}

function formatChipDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
