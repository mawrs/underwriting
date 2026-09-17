"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilterBadges, listFilterChips } from "@/components/list/FilterBadges";
import { ListPagination, usePagedList } from "@/components/list/ListPagination";
import { ComboSearch, Select } from "@/components/ui/Dropdown";
import {
  BORROWER_STATUS_LABEL,
  fileWorkspaceHref,
  loanTypeLabel,
  matchesSearchQuery,
  searchFieldOptions,
  type CategoryFilter,
  type CosignerFilter,
  type SearchField,
} from "@/lib/search";
import { useStore } from "@/lib/store";
import type { WorkflowStatus } from "@/lib/types";

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Loan Type" },
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

export function LoanSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const { applications, ready } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [field, setField] = useState<SearchField>("borrower");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [borrowerStatus, setBorrowerStatus] = useState<"all" | WorkflowStatus>("all");
  const [cosigner, setCosigner] = useState<CosignerFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return applications.filter((app) => {
      if (category !== "all" && app.recordType !== category) return false;
      if (borrowerStatus !== "all" && app.status !== borrowerStatus) return false;
      if (cosigner === "has" && !app.cosigner) return false;
      if (cosigner === "none" && app.cosigner) return false;
      if (fromDate && app.applicationDate.slice(0, 10) < fromDate) return false;
      if (toDate && app.applicationDate.slice(0, 10) > toDate) return false;
      if (!needle) return true;
      return matchesSearchQuery(app, needle, field);
    });
  }, [applications, borrowerStatus, category, cosigner, field, fromDate, query, toDate]);
  const { page, setPage, pageSize, pageItems, count } = usePagedList(rows);
  const suggestions = useMemo(() => searchFieldOptions(applications, field), [applications, field]);
  const chips = listFilterChips(
    { query, category, borrowerStatus, cosigner, fromDate, toDate },
    {
      query: () => setSearch(""),
      category: () => setCategory("all"),
      borrowerStatus: () => setBorrowerStatus("all"),
      cosigner: () => setCosigner("all"),
      fromDate: () => setFromDate(""),
      toDate: () => setToDate(""),
    },
  );

  function setSearch(next: string) {
    setQuery(next);
    setPage(1);
    if (!next && initialQuery) router.replace("/loan-search");
  }

  function clearAllFilters() {
    setQuery("");
    setCategory("all");
    setBorrowerStatus("all");
    setCosigner("all");
    setFromDate("");
    setToDate("");
    setPage(1);
    if (initialQuery) router.replace("/loan-search");
  }

  if (!ready) {
    return <p className="text-sm text-gray-medium">Loading files…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-sm px-xl py-md">
        <h1 className="text-xl font-semibold text-black">Loan Search</h1>
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <ComboSearch
            value={query}
            field={field}
            options={suggestions}
            onChange={setSearch}
            onFieldChange={(next) => {
              setField(next);
              setPage(1);
            }}
          />
          <Select value={category} onChange={(value) => setCategory(value as CategoryFilter)} options={CATEGORIES} />
          <Select
            value={borrowerStatus}
            onChange={(value) => setBorrowerStatus(value as "all" | WorkflowStatus)}
            options={STATUSES}
          />
          <Select value={cosigner} onChange={(value) => setCosigner(value as CosignerFilter)} options={COSIGNER} />
          <DateField placeholder="From date" value={fromDate} onChange={setFromDate} />
          <DateField placeholder="To date" value={toDate} onChange={setToDate} />
        </div>
        <FilterBadges chips={chips} onClearAll={clearAllFilters} />
      </div>

      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center border border-gray-light px-xl py-xl text-center text-sm text-gray-medium">
          No files match those criteria.
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto border border-gray-light">
          <table className="uw-list-table text-left">
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
              {pageItems.map((app) => {
                const href = fileWorkspaceHref(app);
                return (
                  <tr key={app.id} className="uw-list-row">
                    <td className="uw-list-td">
                      <Link
                        href={href}
                        className="uw-list-row-link"
                        aria-label={`Open ${app.borrower.fullName} ${app.id}`}
                      />
                      {loanTypeLabel(app)}
                    </td>
                    <td className="uw-list-td">{app.id}</td>
                    <td className="uw-list-td">{app.borrower.fullName}</td>
                    <td className="uw-list-td">{app.cosigner?.fullName ?? ""}</td>
                    <td className="uw-list-td">{BORROWER_STATUS_LABEL[app.status]}</td>
                    <td className="uw-list-td">{app.cosignerStatus}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <ListPagination count={count} page={page} pageSize={pageSize} onPageChange={setPage} />
        </div>
      )}
    </div>
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
    <label className="uw-list-field relative cursor-pointer">
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
        className="absolute inset-0 z-10 cursor-pointer bg-transparent text-transparent [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-datetime-edit]:text-transparent"
      />
      <span className="h-7 min-w-0 flex-1 truncate text-base leading-7 text-gray-dark">
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

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-gray-dark">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 3.5v4M16 3.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
