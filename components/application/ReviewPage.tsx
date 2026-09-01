"use client";

import type { ReactNode } from "react";
import { useFileWorkspace } from "@/components/application/file-context";
import { StageIntro } from "@/components/application/StageIntro";
import { money } from "@/lib/format";
import { loanTypeFullLabel } from "@/lib/search";
import { useApplication } from "@/lib/store";

function dateMdY(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${month}/${day}/${year}`;
}

export function ReviewPage() {
  const { id } = useFileWorkspace();
  const { application } = useApplication(id);
  if (!application) return null;

  const living =
    application.income.housingPayment > 0
      ? `Renting (${money(application.income.housingPayment)})`
      : "Live with family";
  const job = application.employment[0];

  const left: [string, ReactNode][] = [
    ["Loan Amount", money(application.amount)],
    ["Name", application.borrower.fullName],
    ["Email", application.borrower.email],
    ["Date of Birth", dateMdY(application.borrower.birthDate)],
    ["Permanent Address", `${application.borrower.state} ${application.borrower.zip}`],
    ["Living Arrangement", living],
    ["Cosigner Name", application.cosigner?.fullName ?? "—"],
    ["Cosigner Email", application.cosigner?.email ?? "—"],
    ["Highest Degree Obtained", application.borrower.degree || "—"],
  ];

  const right: [string, ReactNode][] = [
    [
      "Attending School",
      <>
        <p>{application.borrower.school || "—"}</p>
        {application.borrower.degree ? <p>{application.borrower.degree}</p> : null}
      </>,
    ],
    ["FICO Score", String(application.borrower.fico)],
    ["Filing Status", application.borrower.filingStatus || "—"],
    ["Estimated Annual Income", money(application.borrower.statedAnnualIncome)],
    ["Employment Status", job ? `${job.status} · ${job.title}` : "—"],
    ["Cosigner", application.cosigner ? "Yes" : "No"],
    ["Product", loanTypeFullLabel(application)],
    ["Requested term", `${application.requestedTerm} months · ${application.requestedRateType}`],
  ];

  return (
    <StageIntro title="Review Application">
      <div className="flex flex-wrap gap-3xl">
        <FieldList fields={left} />
        <FieldList fields={right} />
      </div>
    </StageIntro>
  );
}

function FieldList({ fields }: { fields: [string, ReactNode][] }) {
  return (
    <dl className="flex min-w-40 flex-col gap-md">
      {fields.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-xs">
          <dt className="text-xs text-gray-medium">{label}</dt>
          <dd className="text-sm text-black">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
