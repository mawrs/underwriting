"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListPagination } from "@/components/list/ListPagination";
import {
  BORROWER_STATUS_LABEL,
  fileWorkspaceHref,
  type CategoryFilter,
  type CosignerFilter,
  type SearchField,
} from "@/lib/search";
import { useStore } from "@/lib/store";
import type { Application, WorkflowStatus } from "@/lib/types";

const SEARCH_FIELDS: { id: SearchField; label: string }[] = [
  { id: "loan-number", label: "Loan #" },
  { id: "borrower", label: "Borrower" },
  { id: "cosigner", label: "Co-Signer" },
];

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Tavant", label: "Student Loan Refi" },
  { id: "InSchool", label: "In-School" },
];

const STATUSES: { id: "all" | WorkflowStatus; label: string }[] = [
  { id: "all", label: "Borrower Status" },
  { id: "pre-review", label: BORROWER_STATUS_LABEL["pre-review"] },
  { id: "needs-docs", label: BORROWER_STATUS_LABEL["needs-docs"] },
  { id: "senior-review", label: BORROWER_STATUS_LABEL["senior-review"] },
  { id: "returned", label: BORROWER_STATUS_LABEL.returned },
  { id: "approved", label: BORROWER_STATUS_LABEL.approved },
];

const COSIGNER: { id: CosignerFilter; label: string }[] = [
  { id: "all", label: "Co-Signer Status" },
  { id: "has", label: "Has co-signer" },
  { id: "none", label: "No co-signer" },
];

function queueLoanType(app: Application) {
  return app.recordType === "InSchool" ? "Student Loan InSchool" : "Student Loan Refi";
}

export function QueueTable() {
  const { applications, ready } = useStore();
  const [query, setQuery] = useState("");
  const [field, setField] = useState<SearchField>("loan-number");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [borrowerStatus, setBorrowerStatus] = useState<"all" | WorkflowStatus>("all");
  const [cosigner, setCosigner] = useState<CosignerFilter>("all");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return applications.filter((app) => {
      if (category !== "all" && app.recordType !== category) return false;
      if (borrowerStatus !== "all" && app.status !== borrowerStatus) return false;
      if (cosigner === "has" && !app.cosigner) return false;
      if (cosigner === "none" && app.cosigner) return false;
      if (!needle) return true;
      if (field === "loan-number") return app.id.toLowerCase().includes(needle);
      if (field === "borrower") {
        return `${app.borrower.fullName} ${app.opportunityName}`.toLowerCase().includes(needle);
      }
      return (app.cosigner?.fullName ?? "").toLowerCase().includes(needle);
    });
  }, [applications, borrowerStatus, category, cosigner, field, query]);

  if (!ready) {
    return <p className="text-sm text-gray-medium">Loading queue…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-sm px-xl py-md">
        <h1 className="text-xl font-semibold text-black">Queue</h1>
        <p className="text-sm text-black">Loan Type</p>
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 xl:grid-cols-5">
          <label className="uw-list-field">
            <SearchIcon />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="h-7 min-w-0 flex-1 bg-transparent text-base text-gray-dark outline-none placeholder:text-gray-dark"
            />
            {query ? (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="text-gray-medium">
                <CloseIcon />
              </button>
            ) : null}
          </label>
          <Select value={field} onChange={(value) => setField(value as SearchField)} options={SEARCH_FIELDS} />
          <Select value={category} onChange={(value) => setCategory(value as CategoryFilter)} options={CATEGORIES} />
          <Select
            value={borrowerStatus}
            onChange={(value) => setBorrowerStatus(value as "all" | WorkflowStatus)}
            options={STATUSES}
          />
          <Select value={cosigner} onChange={(value) => setCosigner(value as CosignerFilter)} options={COSIGNER} />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center border border-gray-light px-xl py-xl text-center text-sm text-gray-medium">
          No files match those criteria.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto border border-gray-light">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="uw-list-th">Loan Type</th>
                <th className="uw-list-th">Loan Number</th>
                <th className="uw-list-th">Borrower</th>
                <th className="uw-list-th">Co-Signer</th>
                <th className="uw-list-th">Borrower Status</th>
                <th className="uw-list-th">Co-Signer Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((app) => {
                const href = fileWorkspaceHref(app);
                return (
                  <tr key={app.id} className="cursor-pointer hover:bg-gray-lightest">
                    <td className="uw-list-td">
                      <Link href={href} className="text-inherit">
                        {queueLoanType(app)}
                      </Link>
                    </td>
                    <td className="uw-list-td">
                      <Link href={href} className="text-primary underline">
                        {app.id}
                      </Link>
                    </td>
                    <td className="uw-list-td">
                      <Link href={href} className="text-primary underline">
                        {app.borrower.fullName}
                      </Link>
                    </td>
                    <td className="uw-list-td">
                      {app.cosigner ? (
                        <Link href={href} className="text-primary underline">
                          {app.cosigner.fullName}
                        </Link>
                      ) : null}
                    </td>
                    <td className="uw-list-td">
                      <Link href={href} className="text-inherit">
                        {BORROWER_STATUS_LABEL[app.status]}
                      </Link>
                    </td>
                    <td className="uw-list-td">
                      {app.cosigner ? (
                        <Link href={href} className="text-inherit">
                          On file
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ListPagination count={rows.length} />
        </div>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="uw-list-field">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 min-w-0 flex-1 appearance-none bg-transparent text-base text-gray-dark outline-none"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon />
    </label>
  );
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-gray-dark">
      <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden className="shrink-0 text-gray-dark">
      <path d="M9 12l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
