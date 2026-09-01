"use client";

import type { Application, Notes } from "@/lib/types";

const fields: { key: keyof Notes; label: string; hint: string }[] = [
  { key: "income", label: "Income", hint: "Documented pay, frequency, and stability" },
  { key: "documentation", label: "Housing", hint: "Stated housing and payment on the application" },
  { key: "creditScore", label: "CR", hint: "Name, DOB, and credit-report match" },
  { key: "fico", label: "FICO", hint: "FICO used vs. exceptions" },
  { key: "degree", label: "DEGREE", hint: "School, credential, and verification" },
  { key: "payoff", label: "Payoff", hint: "Sallie Mae and other payoff cross-check" },
  { key: "general", label: "GRAD DEGREE", hint: "Graduate credential or other rationale" },
];

export const NOTE_FIELDS = fields;

export function notesFilledCount(notes: Notes) {
  return Object.values(notes).filter((value) => value.trim()).length;
}

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
    <div className="overflow-hidden rounded-xs border border-gray-light">
      <div className="flex flex-wrap items-center gap-sm border-b border-gray-light bg-gray-lightest px-sm py-xs text-xs text-gray-medium">
        Comments
        <span className="font-semibold text-charcoal">Salesforce Sans</span>
        <span>13</span>
        <span className="font-bold">B</span>
        <span className="italic">I</span>
        <span className="underline">U</span>
      </div>
      <div className="max-h-[min(60vh,32rem)] space-y-md overflow-y-auto p-md">
        {fields.map((field) => (
          <label key={field.key} className="block">
            <div className="text-sm font-semibold text-charcoal">{field.label}:</div>
            <div className="text-xs text-gray-medium">{field.hint}</div>
            {readOnly ? (
              <p className="mt-xs whitespace-pre-wrap text-sm">
                {application.notes[field.key] || "—"}
              </p>
            ) : (
              <textarea
                className="uw-input mt-xs w-full"
                rows={2}
                value={application.notes[field.key]}
                onChange={(event) =>
                  onChange({ ...application.notes, [field.key]: event.target.value })
                }
              />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
