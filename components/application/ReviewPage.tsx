"use client";

import { useEffect, useRef, useState } from "react";
import { useFileWorkspace } from "@/components/application/file-context";
import { money } from "@/lib/format";
import { useApplication } from "@/lib/store";
import type { Application, Person } from "@/lib/types";

function dateMdY(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;
  return `${month}/${day}/${year}`;
}

function parseMoney(value: string) {
  const next = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(next) ? next : 0;
}

function parseDate(value: string, fallback: string) {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return fallback;
  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function emptyPerson(): Person {
  return {
    fullName: "",
    email: "",
    zip: "",
    state: "",
    street: "",
    city: "",
    phone: "",
    ssnLast4: "",
    citizenship: "",
    graduationYear: "",
    relationship: "",
    livingArrangement: "",
    filingStatus: "",
    birthDate: "",
    creditScore: 0,
    fico: 0,
    statedAnnualIncome: 0,
    degree: "",
    school: "",
  };
}

function addressValue(person: Person) {
  const line1 = person.street.trim();
  const line2 = [person.city, [person.state, person.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [line1, line2].filter(Boolean).join("\n");
}

function degreeValue(person: Person) {
  return [
    person.degree,
    person.school,
    person.graduationYear ? `Graduated ${person.graduationYear}` : "",
  ]
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function ssnValue(last4: string) {
  if (!last4) return "";
  return `*** - ** - ${last4}`;
}

type FieldId =
  | "amount"
  | "name"
  | "birthDate"
  | "phone"
  | "address"
  | "livingArrangement"
  | "highestDegree"
  | "ssn"
  | "citizenship"
  | "income"
  | "employmentStatus"
  | "hasCosigner"
  | "cosignerName"
  | "cosignerEmail"
  | "cosignerRelationship";

export function ReviewPage() {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;
  const file = application;

  const borrower = file.borrower;
  const living =
    borrower.livingArrangement ||
    (application.income.housingPayment > 0 ? "Renting" : "Owning");
  const job = application.employment[0];

  const rows: { id: FieldId; label: string; value: string; multiline?: boolean }[] = [
    { id: "amount", label: "Refinance Amount", value: money(application.amount) },
    { id: "name", label: "Name", value: borrower.fullName },
    { id: "birthDate", label: "Date of Birth", value: dateMdY(borrower.birthDate) },
    { id: "phone", label: "Phone Number", value: borrower.phone },
    { id: "address", label: "Permanent Address", value: addressValue(borrower), multiline: true },
    { id: "livingArrangement", label: "Living Arrangement", value: living },
    { id: "highestDegree", label: "Highest Degree", value: degreeValue(borrower), multiline: true },
    { id: "ssn", label: "Social Security Number (SSN)", value: ssnValue(borrower.ssnLast4) },
    { id: "citizenship", label: "Citizenship Status", value: borrower.citizenship },
    { id: "income", label: "Estimated Annual Income", value: money(borrower.statedAnnualIncome) },
    { id: "employmentStatus", label: "Employment Status", value: job?.status ?? "" },
    { id: "hasCosigner", label: "Cosigner", value: application.cosigner ? "Yes" : "No" },
    { id: "cosignerName", label: "Cosigner Name", value: application.cosigner?.fullName ?? "" },
    { id: "cosignerEmail", label: "Cosigner Email", value: application.cosigner?.email ?? "" },
    {
      id: "cosignerRelationship",
      label: "Cosigner Relationship",
      value: application.cosigner?.relationship ?? "",
    },
  ];

  function save(field: FieldId, value: string) {
    updateApplication(id, patchForField(file, field, value));
  }

  return (
    <div className="bg-white">
      <div className="uw-card-header">
        <h1 className="text-lg text-black">Review Application</h1>
      </div>
      <div className="flex flex-col gap-[10px] p-lg">
        {rows.map((row, index) => (
          <ReviewRow
            key={row.id}
            label={row.label}
            value={row.value}
            multiline={row.multiline}
            last={index === rows.length - 1}
            readOnly={readOnly}
            onSave={(next) => save(row.id, next)}
          />
        ))}
      </div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  multiline,
  last,
  readOnly,
  onSave,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  last: boolean;
  readOnly: boolean;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const skipSave = useRef(false);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [editing, value]);

  useEffect(() => {
    if (!editing) return;
    const el = multiline ? area.current : input.current;
    el?.focus();
    el?.select();
  }, [editing, multiline]);

  function save() {
    const next = (multiline ? area.current?.value : input.current?.value) ?? draft;
    setEditing(false);
    onSave(next);
  }

  return (
    <div className={last ? "" : "border-b border-gray-light pb-[10px]"}>
      <div className="flex items-center gap-[10px]">
        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          <p className="text-sm text-gray-dark">{label}</p>
          {editing ? (
            multiline ? (
              <textarea
                ref={area}
                value={draft}
                rows={3}
                aria-label={label}
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
                }}
                className="min-w-0 rounded-xs border border-primary bg-white px-xs py-px text-sm font-bold text-black outline-none"
              />
            ) : (
              <input
                ref={input}
                value={draft}
                aria-label={label}
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
                className="min-w-0 rounded-xs border border-primary bg-white px-xs py-px text-sm font-bold text-black outline-none"
              />
            )
          ) : (
            <p className="whitespace-pre-line text-sm font-bold text-black">{value || "—"}</p>
          )}
        </div>
        {readOnly ? null : (
          <button
            type="button"
            onMouseDown={() => {
              if (editing) skipSave.current = true;
            }}
            onClick={() => {
              if (editing) save();
              else setEditing(true);
            }}
            className="w-[68px] shrink-0 rounded-xs border border-primary px-[21px] py-[9px] text-sm font-semibold text-gray-dark hover:bg-primary-bg"
          >
            {editing ? "Save" : "Edit"}
          </button>
        )}
      </div>
    </div>
  );
}

function patchForField(application: Application, field: FieldId, value: string) {
  const borrower = application.borrower;
  const next = value.trim();

  if (field === "amount") return { amount: parseMoney(next) };
  if (field === "name") return { borrower: { ...borrower, fullName: next } };
  if (field === "birthDate") return { borrower: { ...borrower, birthDate: parseDate(next, borrower.birthDate) } };
  if (field === "phone") return { borrower: { ...borrower, phone: next } };
  if (field === "livingArrangement") return { borrower: { ...borrower, livingArrangement: next } };
  if (field === "citizenship") return { borrower: { ...borrower, citizenship: next } };
  if (field === "income") return { borrower: { ...borrower, statedAnnualIncome: parseMoney(next) } };
  if (field === "ssn") {
    const last4 = next.replace(/\D/g, "").slice(-4);
    return { borrower: { ...borrower, ssnLast4: last4 } };
  }
  if (field === "address") {
    const [street = "", cityLine = ""] = value.split("\n").map((line) => line.trim());
    const cityMatch = cityLine.match(/^(.*?)(?:,\s*)?([A-Z]{2})?\s*(\d{5}(?:-\d{4})?)?$/i);
    return {
      borrower: {
        ...borrower,
        street,
        city: cityMatch?.[1]?.replace(/,$/, "").trim() ?? cityLine,
        state: cityMatch?.[2]?.toUpperCase() || borrower.state,
        zip: cityMatch?.[3] || borrower.zip,
      },
    };
  }
  if (field === "highestDegree") {
    const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
    const graduated = lines.find((line) => /^graduated\s+/i.test(line));
    const year = graduated?.replace(/^[^\d]*/, "") ?? borrower.graduationYear;
    const rest = lines.filter((line) => !/^graduated\s+/i.test(line));
    return {
      borrower: {
        ...borrower,
        degree: rest[0] ?? "",
        school: rest[1] ?? "",
        graduationYear: year,
      },
    };
  }
  if (field === "employmentStatus") {
    const job = application.employment[0];
    if (!job) return {};
    return { employment: [{ ...job, status: next }, ...application.employment.slice(1)] };
  }
  if (field === "hasCosigner") {
    const yes = /^(y|yes)$/i.test(next);
    if (yes) return { cosigner: application.cosigner ?? emptyPerson() };
    return { cosigner: null };
  }
  const current = application.cosigner ?? emptyPerson();
  if (field === "cosignerName") return { cosigner: { ...current, fullName: next } };
  if (field === "cosignerEmail") return { cosigner: { ...current, email: next } };
  return { cosigner: { ...current, relationship: next } };
}
