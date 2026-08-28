"use client";

import type { Application, Notes } from "@/lib/types";

const fields: { key: keyof Notes; label: string; hint: string }[] = [
  { key: "income", label: "Income", hint: "Documented pay, frequency, and stability" },
  { key: "creditScore", label: "Credit score", hint: "Bureau score used for decisioning" },
  { key: "fico", label: "FICO", hint: "FICO used vs. exceptions" },
  { key: "degree", label: "Degree", hint: "School, credential, and verification" },
  { key: "documentation", label: "Documentation", hint: "KYC, credit report, pay stubs" },
  { key: "payoff", label: "Payoff validation", hint: "Sallie Mae and other payoff cross-check" },
  { key: "general", label: "General", hint: "Approval, counter, or denial rationale" },
];

export function NotesPanel({
  application,
  onChange,
  readOnly = false,
}: {
  application: Application;
  onChange: (notes: Notes) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-sm">
      {fields.map((field) => (
        <label key={field.key} className="uw-card-pad block">
          <div className="text-sm font-semibold text-navy">{field.label}</div>
          <div className="text-xs text-gray-medium">{field.hint}</div>
          {readOnly ? (
            <p className="mt-sm whitespace-pre-wrap text-sm">
              {application.notes[field.key] || "—"}
            </p>
          ) : (
            <textarea
              className="uw-input mt-sm w-full"
              rows={3}
              value={application.notes[field.key]}
              onChange={(event) =>
                onChange({ ...application.notes, [field.key]: event.target.value })
              }
            />
          )}
        </label>
      ))}
    </div>
  );
}
