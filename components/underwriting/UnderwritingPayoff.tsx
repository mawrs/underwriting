"use client";

import { useState } from "react";
import { selectedPayoffTotal } from "@/lib/calculations";
import { money } from "@/lib/format";
import { emptyPayoffLoan, normalizeLiability } from "@/lib/payoffs";
import type { Application, ApplicationPatch, Liability, PayoffType } from "@/lib/types";

export function UnderwritingPayoff({
  application,
  readOnly,
  onChange,
}: {
  application: Application;
  readOnly: boolean;
  onChange: (patch: ApplicationPatch) => void;
}) {
  const loans = (application.payoffs ?? []).map(normalizeLiability);
  const selected = loans.filter((item) => item.selected);

  function setPayoffs(next: Liability[]) {
    onChange({ payoffs: next.map(normalizeLiability) });
  }

  function update(loanId: string, patch: Partial<Liability>) {
    setPayoffs(loans.map((item) => (item.id === loanId ? { ...item, ...patch } : item)));
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col gap-md p-md">
        {loans.length === 0 ? (
          <p className="px-md py-lg text-sm text-gray-medium">No student loans are on this file.</p>
        ) : (
          loans.map((item) => (
            <PayoffCard
              key={item.id}
              loan={item}
              readOnly={readOnly}
              onChange={(patch) => update(item.id, patch)}
            />
          ))
        )}
        <div className="flex items-center justify-end gap-xs px-md">
          <span className="text-sm text-gray-dark">Not seeing your loan?</span>
          <button
            type="button"
            disabled={readOnly}
            className="text-sm font-semibold text-primary hover:text-primary-hover disabled:text-gray-medium"
            onClick={() => setPayoffs([...loans, emptyPayoffLoan()])}
          >
            Add another student loan
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-md border-t border-gray-light bg-gray-lightest px-xl py-5">
        <div>
          <p className="text-sm text-gray-dark">Total amount to be paid off</p>
          <p className="text-xl font-semibold text-black">{money(selectedPayoffTotal(selected))}</p>
        </div>
        <p className="text-xs text-gray-dark">{selected.length} loan(s) selected</p>
      </div>
    </div>
  );
}

function PayoffCard({
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
    <article className="flex flex-col gap-md overflow-hidden rounded-xs border border-gray-light bg-white px-xl py-5">
      <div className="flex flex-col gap-2xl">
        <div className="flex flex-col gap-md">
          <div className="flex items-center justify-between gap-xl">
            <div className="flex min-w-0 flex-1 items-center gap-lg">
              <button
                type="button"
                role="checkbox"
                aria-checked={loan.selected}
                aria-label={`Select ${loan.lender || "student loan"}`}
                disabled={readOnly}
                onClick={() => onChange({ selected: !loan.selected })}
                className={`flex size-[21px] shrink-0 items-center justify-center rounded-[2px] border ${
                  loan.selected ? "border-primary bg-primary text-white" : "border-gray-dark bg-white"
                } disabled:opacity-50`}
              >
                {loan.selected ? <CheckIcon /> : null}
              </button>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-black">{money(loan.balance)}</p>
                <p className="text-sm text-gray-medium">{loan.lender || "New student loan"}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-3xl">
              <div className="min-w-0 text-left">
                <p className="text-xs text-gray-medium">Account Number</p>
                <p className="truncate text-sm font-semibold text-black tabular-nums">
                  {loan.accountNumber || "—"}
                </p>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-medium">Monthly Payment</p>
                <p className="text-sm font-semibold text-black tabular-nums">{money(loan.payment)}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-md">
            <FloatInput
              label="Loan Identifier"
              value={loan.adjLoanIdentifier || loan.loanIdentifier}
              readOnly={readOnly}
              onChange={(value) => onChange({ adjLoanIdentifier: value, loanIdentifier: value })}
            />
            <FloatInput
              label="Adj Creditor Name"
              value={loan.adjCreditorName}
              readOnly={readOnly}
              onChange={(value) => onChange({ adjCreditorName: value })}
            />
            <FloatInput
              label="Adj Account Number"
              value={loan.adjAccountNumber}
              readOnly={readOnly}
              onChange={(value) => onChange({ adjAccountNumber: value })}
            />
          </div>
        </div>
        <div className="flex flex-col items-start gap-sm">
          <PayoffToggle
            value={loan.payoffType}
            readOnly={readOnly}
            onChange={(payoffType) => onChange({ payoffType })}
          />
          <FloatInput
            label="Adj Loan Balance"
            value={loan.adjBalance ? String(loan.adjBalance) : ""}
            readOnly={readOnly}
            onChange={(value) => onChange({ adjBalance: Number(value.replace(/[^0-9.]/g, "")) || 0 })}
          />
        </div>
      </div>

      <div className="flex w-[388px] max-w-full flex-col gap-sm">
        <p className="text-xs text-gray-medium">Lender Address</p>
        {loan.lenderAddresses.map((address) => (
          <label key={address} className="flex items-center gap-xs">
            <span className="relative flex size-7 shrink-0 items-center justify-center">
              <input
                type="radio"
                name={`uw-address-${loan.id}`}
                checked={loan.selectedAddress === address}
                disabled={readOnly}
                onChange={() => onChange({ selectedAddress: address })}
                className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
              />
              <span className="size-[18px] rounded-full border-2 border-gray-light peer-checked:border-brand-green peer-checked:bg-brand-green" />
            </span>
            <span className="text-sm font-semibold text-black">{address}</span>
          </label>
        ))}
        {readOnly ? null : addingAddress ? (
          <div className="flex gap-sm">
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
            className="inline-flex items-center gap-sm text-sm font-semibold text-primary hover:text-primary-hover"
            onClick={() => setAddingAddress(true)}
          >
            <PlusIcon />
            Add new address
          </button>
        )}
      </div>
    </article>
  );
}

function FloatInput({
  label,
  value,
  readOnly,
  onChange,
}: {
  label: string;
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
}) {
  const filled = value.trim().length > 0;
  return (
    <label className="relative min-w-0 w-full flex-1">
      <input
        aria-label={label}
        value={value}
        readOnly={readOnly}
        placeholder={filled ? undefined : label}
        onChange={(event) => onChange(event.target.value)}
        className={`h-[60px] w-full rounded-xs border border-gray-light bg-white text-base outline-none placeholder:text-gray-dark ${
          filled ? "px-md pt-[22px] pb-sm text-black" : "px-md text-gray-dark"
        }`}
      />
      {filled ? (
        <span className="pointer-events-none absolute top-[6px] left-[15px] text-[10px] leading-[1.4] text-gray-dark">
          {label}
        </span>
      ) : null}
    </label>
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
    <div className="inline-flex w-fit overflow-hidden rounded-[62px] border border-primary">
      <button
        type="button"
        disabled={readOnly}
        onClick={() => onChange("full")}
        className={
          value === "full"
            ? "rounded-[62px] bg-primary px-md py-sm text-sm text-white"
            : "rounded-[62px] px-md py-sm text-sm text-gray-dark"
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
            ? "rounded-[62px] bg-primary px-md py-sm text-sm text-white"
            : "rounded-[62px] px-md py-sm text-sm text-gray-dark"
        }
      >
        Partial Payoff
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 6.2l2.4 2.4 4.6-5.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
