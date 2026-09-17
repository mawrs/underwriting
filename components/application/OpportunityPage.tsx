"use client";

import { useEffect, useRef, useState } from "react";
import { useFileWorkspace } from "@/components/application/file-context";
import { dateOnly } from "@/lib/format";
import { useApplication } from "@/lib/store";
import type {
  Application,
  ApplicationPatch,
  OpportunityField,
  OpportunityFields,
  WorkflowStatus,
} from "@/lib/types";

const LOAN_STATUS: Record<WorkflowStatus, string> = {
  "pre-review": "Borrower Application Submitted",
  "needs-docs": "Needs Documentation",
  "senior-review": "UW Final Review",
  returned: "Returned to UW",
  approved: "Approved",
};

function addDays(value: string, days: number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function resolveOpportunity(application: Application): Required<OpportunityFields> {
  const extra = application.opportunity ?? {};
  return {
    opportunityName: extra.opportunityName ?? application.opportunityName,
    loanStatus: extra.loanStatus ?? LOAN_STATUS[application.status],
    stage: extra.stage ?? application.stage,
    accountName: extra.accountName ?? application.borrower.fullName,
    leadSource: extra.leadSource ?? "",
    recordType: extra.recordType ?? application.recordType,
    preReviewPriority: extra.preReviewPriority ?? application.difficulty,
    parentLoan: extra.parentLoan ?? "",
    owner: extra.owner ?? application.owner,
    cosignerDeadline: extra.cosignerDeadline ?? "",
    closeDate: extra.closeDate ?? dateOnly(addDays(application.applicationDate, 14)),
    loanStatusDate: extra.loanStatusDate ?? dateOnly(application.applicationDate),
    probability: extra.probability ?? "55%",
    lastReferralPartner: extra.lastReferralPartner ?? application.referrer,
    referralPartner: extra.referralPartner ?? application.referrer,
    duplicateApplication: extra.duplicateApplication ?? "",
  };
}

function patchForField(
  application: Application,
  key: OpportunityField,
  value: string,
): ApplicationPatch {
  const patch: ApplicationPatch = { opportunity: { [key]: value } };
  if (key === "opportunityName") patch.opportunityName = value;
  if (key === "stage") patch.stage = value;
  if (key === "accountName") patch.borrower = { ...application.borrower, fullName: value };
  if (key === "owner") patch.owner = value;
  if (key === "referralPartner") patch.referrer = value;
  if (key === "preReviewPriority" && (value === "Medium" || value === "Hard")) {
    patch.difficulty = value;
  }
  if (key === "recordType" && (value === "InSchool" || value === "Tavant")) {
    patch.recordType = value;
  }
  return patch;
}

export function OpportunityPage() {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;
  const file = application;

  const fields = resolveOpportunity(file);

  function save(key: OpportunityField, value: string) {
    updateApplication(id, patchForField(file, key, value));
  }

  const left: OpportunityField[] = [
    "opportunityName",
    "loanStatus",
    "stage",
    "accountName",
    "leadSource",
    "recordType",
    "preReviewPriority",
    "parentLoan",
  ];
  const right: OpportunityField[] = [
    "owner",
    "cosignerDeadline",
    "closeDate",
    "loanStatusDate",
    "probability",
    "lastReferralPartner",
    "referralPartner",
    "duplicateApplication",
  ];

  return (
    <div className="flex min-h-full flex-col md:flex-row md:items-stretch">
      <section className="flex min-w-0 flex-1 flex-col border-b border-gray-light">
        <PanelHeader>Opportunity Information</PanelHeader>
        <div className="p-lg">
          <div className="flex flex-wrap gap-3xl">
            <FieldList fields={left} values={fields} readOnly={readOnly} onSave={save} />
            <FieldList fields={right} values={fields} readOnly={readOnly} onSave={save} />
          </div>
        </div>
      </section>
      <section className="flex w-full flex-col border-t border-b border-gray-light md:w-[498px] md:shrink-0 md:border-t-0 md:border-l">
        <PanelHeader as="h2">Summary</PanelHeader>
        <SummaryList application={application} />
      </section>
    </div>
  );
}

function PanelHeader({ children, as: Tag = "h1" }: { children: string; as?: "h1" | "h2" }) {
  return (
    <div className="uw-card-header">
      <Tag className="text-lg text-black">{children}</Tag>
    </div>
  );
}

function daysSince(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const start = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - start) / 86_400_000);
}

function daysLabel(days: number | null) {
  if (days == null) return "—";
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function paddedDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}/${date.getFullYear()}`;
}

function SummaryList({ application }: { application: Application }) {
  const decisionDate = application.approvedAt ?? addDays(application.applicationDate, 14);
  const items: { label: string; value: string; tone?: "days" }[] = [
    { label: "Decision Date:", value: paddedDate(decisionDate) },
    {
      label: "Days since borrower hard pull:",
      value: daysLabel(daysSince(application.hardCreditDate)),
      tone: "days",
    },
    {
      label: "Days since cosigner hard pull:",
      value: application.cosigner ? daysLabel(daysSince(application.hardCreditDate)) : "—",
      tone: application.cosigner ? "days" : undefined,
    },
    {
      label: "Days since Initial PreReview:",
      value: daysLabel(daysSince(application.preReviewAt)),
      tone: "days",
    },
    { label: "Degree:", value: application.borrower.degree || "—" },
    { label: "Repayment:", value: "Immediate" },
  ];

  return (
    <dl className="flex flex-col gap-md p-lg">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-xs">
          <dt className="text-sm font-semibold text-black">{item.label}</dt>
          <dd className={`text-sm ${item.tone === "days" ? "text-success" : "text-charcoal"}`}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const LABELS: Record<OpportunityField, string> = {
  opportunityName: "Opportunity Name",
  loanStatus: "Loan Status",
  stage: "Stage",
  accountName: "Account Name",
  leadSource: "Lead Source",
  recordType: "Opportunity Record Type",
  preReviewPriority: "PreReview Priority",
  parentLoan: "Parent Loan",
  owner: "Opportunity Owner",
  cosignerDeadline: "Cosigner Deadline",
  closeDate: "Close Date",
  loanStatusDate: "Loan Status Date",
  probability: "Probability (%)",
  lastReferralPartner: "Last Referral Partner",
  referralPartner: "Referral Partner",
  duplicateApplication: "Duplicate Application",
};

function FieldList({
  fields,
  values,
  readOnly,
  onSave,
}: {
  fields: OpportunityField[];
  values: Required<OpportunityFields>;
  readOnly: boolean;
  onSave: (key: OpportunityField, value: string) => void;
}) {
  return (
    <dl className="flex min-w-40 flex-col gap-md">
      {fields.map((key) => (
        <EditableField
          key={key}
          field={key}
          label={LABELS[key]}
          value={values[key]}
          readOnly={readOnly}
          onSave={onSave}
        />
      ))}
    </dl>
  );
}

function EditableField({
  field,
  label,
  value,
  readOnly,
  onSave,
}: {
  field: OpportunityField;
  label: string;
  value: string;
  readOnly: boolean;
  onSave: (key: OpportunityField, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  const skipSave = useRef(false);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [editing, value]);

  useEffect(() => {
    if (!editing) return;
    input.current?.focus();
    input.current?.select();
  }, [editing]);

  function save() {
    const next = input.current?.value ?? draft;
    setEditing(false);
    onSave(field, next);
  }

  return (
    <div className="group flex flex-col gap-xs">
      <dt className="text-xs text-gray-medium">{label}</dt>
      <dd className="flex min-h-5 items-center gap-xs">
        {editing ? (
          <input
            ref={input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
              if (skipSave.current) {
                skipSave.current = false;
                return;
              }
              save();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                skipSave.current = true;
                setDraft(value);
                setEditing(false);
              }
              if (event.key === "Enter") {
                event.preventDefault();
                save();
              }
            }}
            aria-label={label}
            className="min-w-0 flex-1 rounded-xs border border-primary bg-white px-xs py-px text-sm text-black outline-none"
          />
        ) : (
          <>
            <ValueDisplay field={field} value={value} />
            {readOnly ? null : (
              <button
                type="button"
                aria-label={`Edit ${label}`}
                onClick={() => setEditing(true)}
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-xs text-gray-medium opacity-0 group-hover:opacity-100 hover:bg-gray-lightest hover:text-primary focus-visible:opacity-100"
              >
                <PencilIcon />
              </button>
            )}
          </>
        )}
      </dd>
    </div>
  );
}

function ValueDisplay({ field, value }: { field: OpportunityField; value: string }) {
  if (!value) return <span className="text-sm text-black">&nbsp;</span>;
  if (field === "accountName") {
    return <span className="text-sm text-primary underline">{value}</span>;
  }
  if (field === "owner") {
    return <Owner name={value} />;
  }
  return <span className="text-sm text-black">{value}</span>;
}

function Owner({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-sm text-sm text-black">
      <span
        aria-hidden
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-bg text-[10px] font-semibold text-primary"
      >
        {initials(name)}
      </span>
      {name}
    </span>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M11.2 2.8l2 2-8.4 8.4H2.8v-2L11.2 2.8z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M10 4l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
