"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { QueueViewSelect } from "@/components/queue/QueueViewSelect";
import { dateOnly, money, shortDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { QueueViewId } from "@/lib/queues";
import type { Application, WorkflowStatus } from "@/lib/types";

type SortKey =
  | "recordType"
  | "hardCreditDate"
  | "applicationDate"
  | "priority"
  | "preReviewAt"
  | "referrer"
  | "difficulty"
  | "cosigner"
  | "stage"
  | "opportunityName"
  | "amount"
  | "underwriter"
  | "owner";
type SortDir = "asc" | "desc";

const SORT_VALUE: Record<SortKey, (app: Application) => string | number> = {
  recordType: (app) => app.recordType,
  hardCreditDate: (app) => app.hardCreditDate,
  applicationDate: (app) => app.applicationDate,
  priority: (app) => app.priority,
  preReviewAt: (app) => app.preReviewAt,
  referrer: (app) => app.referrer,
  difficulty: (app) => app.difficulty,
  cosigner: (app) => (app.cosigner ? 1 : 0),
  stage: (app) => app.stage,
  opportunityName: (app) => app.opportunityName,
  amount: (app) => app.amount,
  underwriter: (app) => app.underwriter,
  owner: (app) => app.owner,
};

export function QueueTable({
  statuses,
  hrefFor,
  empty,
  viewId,
}: {
  statuses: WorkflowStatus[];
  hrefFor: "primary" | "senior";
  empty: string;
  viewId: QueueViewId;
}) {
  const { applications, ready } = useStore();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recordType");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function href(app: Application) {
    return hrefFor === "senior"
      ? `/senior-queue/${app.id}/documents`
      : `/applications/${app.id}/documents`;
  }

  const rows = useMemo(() => {
    const filtered = applications.filter((app) => statuses.includes(app.status));
    const q = query.trim().toLowerCase();
    const searched = q
      ? filtered.filter((app) =>
          [
            app.opportunityName,
            app.underwriter,
            app.owner,
            app.referrer,
            app.id,
            app.stage,
            app.recordType,
            app.difficulty,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : filtered;

    const dir = sortDir === "asc" ? 1 : -1;
    return [...searched].sort((a, b) => {
      const left = SORT_VALUE[sortKey](a);
      const right = SORT_VALUE[sortKey](b);
      if (left < right) return -1 * dir;
      if (left > right) return 1 * dir;
      return a.priority - b.priority;
    });
  }, [applications, query, sortDir, sortKey, statuses]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (!ready) {
    return <p className="text-sm text-gray-medium">Loading queue…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-sm border border-gray-light bg-white shadow-[0px_1px_0.5px_0.05px_rgba(29,41,61,0.02)]">
      <div className="flex shrink-0 flex-col gap-sm p-lg">
        <div className="flex items-center gap-[10px]">
          <label className="flex h-[38px] min-w-0 flex-1 items-center justify-between rounded-xs border border-gray-light bg-gray-extra-light px-md">
            <span className="flex min-w-0 items-center gap-sm">
              <SearchIcon />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this list…"
                className="min-w-0 flex-1 bg-transparent text-base text-charcoal outline-none placeholder:text-gray-medium"
              />
            </span>
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="text-gray-medium"
              >
                <CloseIcon />
              </button>
            ) : null}
          </label>
          <QueueViewSelect value={viewId} />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center border-t border-gray-light px-lg py-xl text-center text-sm text-gray-medium">
          {empty}
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="border-y border-gray-light bg-gray-lightest">
                <th className="h-11 bg-gray-lightest px-sm text-xs font-normal text-gray-medium">#</th>
                <HeaderCell
                  label="Opportunity Record Type"
                  active={sortKey === "recordType"}
                  onClick={() => toggleSort("recordType")}
                />
                <HeaderCell
                  label="Hard Credit Date"
                  active={sortKey === "hardCreditDate"}
                  onClick={() => toggleSort("hardCreditDate")}
                />
                <HeaderCell
                  label="Application Date"
                  active={sortKey === "applicationDate"}
                  onClick={() => toggleSort("applicationDate")}
                />
                <HeaderCell
                  label="UW Priority"
                  active={sortKey === "priority"}
                  onClick={() => toggleSort("priority")}
                />
                <HeaderCell
                  label="UW-PreReview Start Date"
                  active={sortKey === "preReviewAt"}
                  onClick={() => toggleSort("preReviewAt")}
                />
                <HeaderCell
                  label="Last Referral Source"
                  active={sortKey === "referrer"}
                  onClick={() => toggleSort("referrer")}
                />
                <HeaderCell
                  label="Difficulty"
                  active={sortKey === "difficulty"}
                  onClick={() => toggleSort("difficulty")}
                />
                <HeaderCell
                  label="Cosigner"
                  active={sortKey === "cosigner"}
                  onClick={() => toggleSort("cosigner")}
                />
                <HeaderCell
                  label="Stage"
                  active={sortKey === "stage"}
                  onClick={() => toggleSort("stage")}
                />
                <HeaderCell
                  label="Opportunity Name"
                  active={sortKey === "opportunityName"}
                  onClick={() => toggleSort("opportunityName")}
                />
                <HeaderCell
                  label="Amount"
                  active={sortKey === "amount"}
                  onClick={() => toggleSort("amount")}
                  align="right"
                />
                <HeaderCell
                  label="Underwriter"
                  active={sortKey === "underwriter"}
                  onClick={() => toggleSort("underwriter")}
                />
                <HeaderCell
                  label="Owner Full Name"
                  active={sortKey === "owner"}
                  onClick={() => toggleSort("owner")}
                />
                <th className="h-11 w-8 bg-gray-lightest px-xs" />
              </tr>
            </thead>
            <tbody>
              {rows.map((app, index) => (
                <tr key={app.id} className="border-b border-gray-light">
                  <td className="whitespace-nowrap px-sm py-sm text-gray-medium">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-sm py-sm text-charcoal">{app.recordType}</td>
                  <td className="whitespace-nowrap px-sm py-sm text-charcoal">
                    {dateOnly(app.hardCreditDate)}
                  </td>
                  <td className="whitespace-nowrap px-sm py-sm text-charcoal">
                    {dateOnly(app.applicationDate)}
                  </td>
                  <td className="whitespace-nowrap px-sm py-sm text-charcoal">{app.priority}</td>
                  <td className="whitespace-nowrap px-sm py-sm text-charcoal">
                    {shortDate(app.preReviewAt)}
                  </td>
                  <td className="whitespace-nowrap px-sm py-sm text-charcoal">{app.referrer || "—"}</td>
                  <td className="whitespace-nowrap px-sm py-sm text-charcoal">{app.difficulty}</td>
                  <td className="px-sm py-sm">
                    <CosignerMark present={Boolean(app.cosigner)} />
                  </td>
                  <td className="whitespace-nowrap px-sm py-sm text-charcoal">{app.stage}</td>
                  <td className="whitespace-nowrap px-sm py-sm">
                    <Link href={href(app)} className="font-semibold text-primary hover:text-primary-hover">
                      {app.opportunityName}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-sm py-sm text-right text-charcoal">
                    {money(app.amount)}
                  </td>
                  <td className="whitespace-nowrap px-sm py-sm text-primary">{app.underwriter}</td>
                  <td className="whitespace-nowrap px-sm py-sm text-primary">{app.owner}</td>
                  <td className="px-xs py-sm">
                    <Link
                      href={href(app)}
                      aria-label={`Open ${app.opportunityName}`}
                      className="inline-flex size-7 items-center justify-center rounded-xs text-gray-medium hover:bg-gray-lightest hover:text-charcoal"
                    >
                      <ChevronDownIcon />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function HeaderCell({
  label,
  active,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <th className={`h-11 bg-gray-lightest px-sm ${align === "right" ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-xs whitespace-nowrap text-xs font-normal text-gray-dark ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
      >
        {label}
        <SortIcon active={active} />
      </button>
    </th>
  );
}

function CosignerMark({ present }: { present: boolean }) {
  if (present) {
    return (
      <span className="inline-flex text-success" aria-label="Has cosigner">
        <CheckIcon />
      </span>
    );
  }
  return (
    <span className="inline-flex text-gray-light" aria-label="No cosigner">
      <EmptyBoxIcon />
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <circle cx="4.5" cy="4.5" r="3.75" stroke="#888A8D" strokeWidth="1.2" />
      <path d="M7.5 7.5L10 10" stroke="#888A8D" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="#888A8D" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SortIcon({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 2.5L10 6H4L7 2.5z" fill={active ? "#535459" : "#C4C4C4"} />
      <path d="M7 11.5L4 8h6L7 11.5z" fill={active ? "#535459" : "#C4C4C4"} />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmptyBoxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="3.25" y="3.25" width="9.5" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}
