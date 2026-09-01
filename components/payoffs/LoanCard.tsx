"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import { normalizeLiability } from "@/lib/payoffs";
import type { Liability, PayoffType } from "@/lib/types";

export function LoanCard({
  item,
  variant,
  readOnly,
  onChange,
}: {
  item: Liability;
  variant: "all" | "payoff";
  readOnly: boolean;
  onChange: (patch: Partial<Liability>) => void;
}) {
  const loan = normalizeLiability(item);

  return (
    <article
      className={`max-w-[696px] rounded-sm border bg-white p-md ${
        loan.selected ? "border-primary-bg-dev" : "border-gray-light"
      }`}
    >
      <div className="flex flex-wrap items-start gap-lg">
        <label className="flex items-start gap-sm pt-[2px]">
          <input
            type="checkbox"
            className="mt-[3px] size-4 accent-primary"
            checked={loan.selected}
            disabled={readOnly}
            onChange={(event) => onChange({ selected: event.target.checked })}
          />
          <span>
            <span className="block text-xl font-semibold text-black">{money(loan.balance)}</span>
            <span className="text-sm text-gray-dark">{loan.lender || "New student loan"}</span>
          </span>
        </label>
        {variant === "all" ? (
          <div className="grid min-w-0 flex-1 grid-cols-3 gap-md">
            <ReadField label="Account Number" value={loan.accountNumber || "—"} />
            <ReadField label="Loan Identifier" value={loan.loanIdentifier || "—"} />
            <ReadField label="Monthly Payment" value={money(loan.payment)} />
          </div>
        ) : null}
      </div>

      {variant === "payoff" ? (
        <PayoffFields loan={loan} readOnly={readOnly} onChange={onChange} />
      ) : null}
    </article>
  );
}

function PayoffFields({
  loan,
  readOnly,
  onChange,
}: {
  loan: Liability;
  readOnly: boolean;
  onChange: (patch: Partial<Liability>) => void;
}) {
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");

  function addAddress() {
    const next = newAddress.trim();
    if (!next) return;
    const addresses = [...loan.lenderAddresses, next];
    onChange({ lenderAddresses: addresses, selectedAddress: next });
    setNewAddress("");
    setAddingAddress(false);
  }

  return (
    <div className="mt-md flex flex-col gap-md">
      <div className="grid grid-cols-2 gap-md">
        <TextField
          label="Adj Creditor Name"
          value={loan.adjCreditorName}
          readOnly={readOnly}
          onChange={(value) => onChange({ adjCreditorName: value })}
        />
        <TextField
          label="Adj Account Number"
          value={loan.adjAccountNumber}
          readOnly={readOnly}
          onChange={(value) => onChange({ adjAccountNumber: value })}
        />
        <TextField
          label="Loan Identifier"
          value={loan.adjLoanIdentifier}
          readOnly={readOnly}
          onChange={(value) => onChange({ adjLoanIdentifier: value })}
        />
        <TextField
          label="Adj Loan Balance"
          value={loan.adjBalance ? String(loan.adjBalance) : ""}
          readOnly={readOnly}
          prefix="$"
          onChange={(value) => onChange({ adjBalance: Number(value) || 0 })}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-md">
        <PayoffToggle
          value={loan.payoffType}
          readOnly={readOnly}
          onChange={(payoffType) => onChange({ payoffType })}
        />
        <label className="inline-flex items-center gap-sm text-sm text-gray-dark">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={loan.confirmed}
            disabled={readOnly}
            onChange={(event) => onChange({ confirmed: event.target.checked })}
          />
          Confirmed
        </label>
      </div>

      <div>
        <p className="mb-xs text-xs text-gray-medium">Lender Address</p>
        <div className="flex flex-col gap-sm">
          {loan.lenderAddresses.map((address) => (
            <label key={address} className="flex items-start gap-sm text-sm text-black">
              <input
                type="radio"
                name={`address-${loan.id}`}
                className="mt-[3px] accent-primary"
                checked={loan.selectedAddress === address}
                disabled={readOnly}
                onChange={() => onChange({ selectedAddress: address })}
              />
              {address}
            </label>
          ))}
        </div>
        {readOnly ? null : addingAddress ? (
          <div className="mt-sm flex gap-sm">
            <input
              className="uw-input min-w-0 flex-1"
              value={newAddress}
              placeholder="Street, city, state ZIP"
              onChange={(event) => setNewAddress(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addAddress();
                }
              }}
            />
            <button type="button" className="uw-btn-primary" onClick={addAddress}>
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="mt-sm text-sm text-primary hover:text-primary-hover"
            onClick={() => setAddingAddress(true)}
          >
            + Add new address
          </button>
        )}
      </div>
    </div>
  );
}

function PayoffToggle({
  value,
  readOnly,
  onChange,
}: {
  value: PayoffType;
  readOnly: boolean;
  onChange: (value: PayoffType) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-gray-light p-[2px]">
      <button
        type="button"
        disabled={readOnly}
        onClick={() => onChange("full")}
        className={
          value === "full"
            ? "rounded-full bg-primary px-md py-xs text-sm font-semibold text-white"
            : "rounded-full px-md py-xs text-sm text-primary"
        }
      >
        Full Payoff
      </button>
      <button
        type="button"
        disabled={readOnly}
        onClick={() => onChange("partial")}
        className={
          value === "partial"
            ? "rounded-full bg-primary px-md py-xs text-sm font-semibold text-white"
            : "rounded-full px-md py-xs text-sm text-primary"
        }
      >
        Partial payoff
      </button>
    </div>
  );
}

function TextField({
  label,
  value,
  readOnly,
  prefix,
  onChange,
}: {
  label: string;
  value: string;
  readOnly: boolean;
  prefix?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-xs">
      <span className="text-xs text-gray-medium">{label}</span>
      {readOnly ? (
        <span className="text-sm text-black">
          {prefix && value ? `${prefix} ${value}` : value || "—"}
        </span>
      ) : (
        <span className="uw-input flex items-center gap-xs">
          {prefix ? <span className="text-gray-medium">{prefix}</span> : null}
          <input
            className="min-w-0 flex-1 bg-transparent outline-none"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </span>
      )}
    </label>
  );
}

function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-medium">{label}</p>
      <p className="truncate text-sm text-black">{value}</p>
    </div>
  );
}
