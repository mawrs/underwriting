"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListPagination } from "@/components/list/ListPagination";
import {
  BORROWER_STATUS_LABEL,
  fileWorkspaceHref,
  loanTypeLabel,
  type CategoryFilter,
  type CosignerFilter,
  type SearchField,
} from "@/lib/search";
import { useStore } from "@/lib/store";
import type { WorkflowStatus } from "@/lib/types";

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

type SearchState = {
  query: string;
  field: SearchField;
  category: CategoryFilter;
  borrowerStatus: "all" | WorkflowStatus;
  cosigner: CosignerFilter;
  fromDate: string;
  toDate: string;
  anyField?: boolean;
};

function searchState(overrides: Partial<SearchState> = {}): SearchState {
  return {
    query: "",
    field: "loan-number",
    category: "all",
    borrowerStatus: "all",
    cosigner: "all",
    fromDate: "",
    toDate: "",
    ...overrides,
  };
}

export function LoanSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const { applications, ready } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [field, setField] = useState<SearchField>("loan-number");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [borrowerStatus, setBorrowerStatus] = useState<"all" | WorkflowStatus>("all");
  const [cosigner, setCosigner] = useState<CosignerFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [submitted, setSubmitted] = useState<SearchState>(() =>
    searchState(initialQuery ? { query: initialQuery, anyField: true } : {}),
  );

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery) {
      setSubmitted(searchState({ query: initialQuery, anyField: true }));
      return;
    }
    setSubmitted((prev) => (prev.anyField ? searchState() : prev));
  }, [initialQuery]);

  const rows = useMemo(() => {
    const needle = submitted.query.trim().toLowerCase();
    return applications.filter((app) => {
      if (submitted.category !== "all" && app.recordType !== submitted.category) return false;
      if (submitted.borrowerStatus !== "all" && app.status !== submitted.borrowerStatus) return false;
      if (submitted.cosigner === "has" && !app.cosigner) return false;
      if (submitted.cosigner === "none" && app.cosigner) return false;
      if (submitted.fromDate && app.applicationDate.slice(0, 10) < submitted.fromDate) return false;
      if (submitted.toDate && app.applicationDate.slice(0, 10) > submitted.toDate) return false;
      if (!needle) return true;
      if (submitted.anyField) {
        return [app.id, app.borrower.fullName, app.opportunityName, app.cosigner?.fullName ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      }
      if (submitted.field === "loan-number") return app.id.toLowerCase().includes(needle);
      if (submitted.field === "borrower") {
        return `${app.borrower.fullName} ${app.opportunityName}`.toLowerCase().includes(needle);
      }
      return (app.cosigner?.fullName ?? "").toLowerCase().includes(needle);
    });
  }, [applications, submitted]);

  function runSearch(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(searchState({ query, field, category, borrowerStatus, cosigner, fromDate, toDate }));
  }

  function clearSearch() {
    setQuery("");
    setSubmitted((prev) => ({ ...prev, query: "", anyField: false }));
    if (initialQuery) router.replace("/loan-search");
  }

  if (!ready) {
    return <p className="text-sm text-gray-medium">Loading files…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-sm px-xl py-md">
        <h1 className="text-xl font-semibold text-black">Loan Search</h1>
        <form className="flex shrink-0 flex-col gap-sm" onSubmit={runSearch}>
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
                <button type="button" aria-label="Clear search" onClick={clearSearch} className="text-gray-medium">
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
          <div className="flex flex-wrap items-start gap-sm">
            <DateField placeholder="From Date (dd/mm/yyyy)" value={fromDate} onChange={setFromDate} />
            <DateField placeholder="To Date (dd/mm/yyyy)" value={toDate} onChange={setToDate} />
            <button
              type="submit"
              className="h-11 w-[107px] rounded-xs bg-primary text-lg font-semibold text-white hover:bg-primary-hover"
            >
              Search
            </button>
          </div>
        </form>
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
                        {loanTypeLabel(app)}
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

function DateField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="uw-list-field relative w-[283px] shrink-0 cursor-pointer">
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
        className="absolute inset-0 z-10 cursor-pointer bg-transparent text-transparent [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-datetime-edit]:text-transparent"
      />
      <span className="h-7 min-w-0 flex-1 text-base leading-[28px] text-gray-dark">
        {value ? formatDisplayDate(value) : placeholder}
      </span>
      <CalendarIcon />
    </label>
  );
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
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

function ChevronDownIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden className="shrink-0 text-gray-dark">
      <path d="M9 12l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-gray-dark">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 3.5v4M16 3.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
