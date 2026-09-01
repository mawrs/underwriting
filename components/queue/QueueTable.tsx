"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { ListPagination } from "@/components/list/ListPagination";
import { QueueViewSelect } from "@/components/queue/QueueViewSelect";
import { dateOnly, money, shortDate } from "@/lib/format";
import type { QueueViewId } from "@/lib/queues";
import { useStore } from "@/lib/store";
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
  title,
  statuses,
  hrefFor,
  empty,
  viewId,
}: {
  title: ReactNode;
  statuses: WorkflowStatus[];
  hrefFor: "primary" | "senior";
  empty: string;
  viewId: QueueViewId;
}) {
  const { applications, ready } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recordType");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function href(app: Application) {
    return hrefFor === "senior"
      ? `/senior-queue/${app.id}/review`
      : `/applications/${app.id}/review`;
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-col gap-sm px-xl py-md">
        {title}
        <div className="flex gap-sm">
          <label className="uw-list-field min-w-0 flex-1">
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
          <QueueViewSelect value={viewId} />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center border border-gray-light px-xl py-xl text-center text-sm text-gray-medium">
          {empty}
        </p>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto border border-gray-light">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="uw-list-th">#</th>
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
                <HeaderCell label="Stage" active={sortKey === "stage"} onClick={() => toggleSort("stage")} />
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
              </tr>
            </thead>
            <tbody>
              {rows.map((app, index) => {
                const fileHref = href(app);
                return (
                  <tr
                    key={app.id}
                    tabIndex={0}
                    role="link"
                    aria-label={`Open ${app.opportunityName}`}
                    className="cursor-pointer hover:bg-white"
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey) {
                        window.open(fileHref, "_blank");
                        return;
                      }
                      router.push(fileHref);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(fileHref);
                      }
                    }}
                  >
                    <td className="uw-list-td">{index + 1}</td>
                    <td className="uw-list-td">{app.recordType}</td>
                    <td className="uw-list-td">{dateOnly(app.hardCreditDate)}</td>
                    <td className="uw-list-td">{dateOnly(app.applicationDate)}</td>
                    <td className="uw-list-td">{app.priority}</td>
                    <td className="uw-list-td">{shortDate(app.preReviewAt)}</td>
                    <td className="uw-list-td">{app.referrer || "—"}</td>
                    <td className="uw-list-td">{app.difficulty}</td>
                    <td className="uw-list-td">
                      <CosignerMark present={Boolean(app.cosigner)} />
                    </td>
                    <td className="uw-list-td">{app.stage}</td>
                    <td className="uw-list-td text-primary underline">{app.opportunityName}</td>
                    <td className="uw-list-td text-right">{money(app.amount)}</td>
                    <td className="uw-list-td text-primary underline">{app.underwriter}</td>
                    <td className="uw-list-td text-primary underline">{app.owner}</td>
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
    <th className={`uw-list-th ${align === "right" ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-xs text-sm font-semibold text-black ${
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <circle cx="11" cy="11" r="6.25" stroke="#535459" strokeWidth="1.4" />
      <path d="M16 16l4 4" stroke="#535459" strokeWidth="1.4" strokeLinecap="round" />
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
      <path d="M7 2.5L10 6H4L7 2.5z" fill={active ? "#000000" : "#C4C4C4"} />
      <path d="M7 11.5L4 8h6L7 11.5z" fill={active ? "#000000" : "#C4C4C4"} />
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
