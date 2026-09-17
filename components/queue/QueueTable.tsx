"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FilterBadges, listFilterChips } from "@/components/list/FilterBadges";
import { ListPagination, usePagedList } from "@/components/list/ListPagination";
import { ComboSearch, Select } from "@/components/ui/Dropdown";
import {
  BORROWER_STATUS_LABEL,
  fileWorkspaceHref,
  matchesSearchQuery,
  searchFieldOptions,
  type CategoryFilter,
  type CosignerFilter,
  type SearchField,
} from "@/lib/search";
import { useStore } from "@/lib/store";
import type { Application, WorkflowStatus } from "@/lib/types";

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

function queueLoanType(app: Application) {
  return app.recordType === "InSchool" ? "Student Loan InSchool" : "Student Loan Refi";
}

export function QueueTable() {
  const { applications, ready } = useStore();
  const [query, setQuery] = useState("");
  const [field, setField] = useState<SearchField>("borrower");
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
      return matchesSearchQuery(app, needle, field);
    });
  }, [applications, borrowerStatus, category, cosigner, field, query]);
  const { page, setPage, pageSize, pageItems, count } = usePagedList(rows);
  const suggestions = useMemo(() => searchFieldOptions(applications, field), [applications, field]);
  const chips = listFilterChips(
    { query, category, borrowerStatus, cosigner },
    {
      query: () => {
        setQuery("");
        setPage(1);
      },
      category: () => setCategory("all"),
      borrowerStatus: () => setBorrowerStatus("all"),
      cosigner: () => setCosigner("all"),
    },
  );

  function clearAllFilters() {
    setQuery("");
    setCategory("all");
    setBorrowerStatus("all");
    setCosigner("all");
    setPage(1);
  }

  if (!ready) {
    return <p className="text-sm text-gray-medium">Loading queue…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-sm px-xl py-md">
        <h1 className="text-xl font-semibold text-black">Queue</h1>
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 xl:grid-cols-4">
          <ComboSearch
            value={query}
            field={field}
            options={suggestions}
            onChange={(next) => {
              setQuery(next);
              setPage(1);
            }}
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
                      {queueLoanType(app)}
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

