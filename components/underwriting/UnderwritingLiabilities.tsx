"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Button, buttonClass } from "@/components/ui/Button";
import { Select } from "@/components/ui/Dropdown";
import { sampleDocumentHref } from "@/lib/documents";
import { exportLiabilities } from "@/lib/export/xlsx";
import { money } from "@/lib/format";
import type { Application, ApplicationPatch, DebtTrade } from "@/lib/types";

export function UnderwritingLiabilities({
  application,
  readOnly,
  onChange,
  showHeader = false,
  basePath,
}: {
  application: Application;
  readOnly: boolean;
  onChange: (patch: ApplicationPatch) => void;
  showHeader?: boolean;
  basePath?: string;
}) {
  const trades = application.debtTrades;
  const total = trades
    .filter((trade) => trade.includeInDti)
    .reduce((sum, trade) => sum + ((trade.adjPayment ?? trade.payment) || 0), 0);
  const housingId = application.underwriting.primaryHousingTradeId ?? "";
  const housingTrades = trades.filter((trade) =>
    /mortgage|housing|home_equity|rent/i.test(trade.category),
  );
  const creditDoc = application.documents.find((item) => item.kind === "credit-report");
  const reportHref = creditDoc
    ? sampleDocumentHref(creditDoc.fileName)
    : `${basePath ?? ""}/documents`;

  function patchTrade(id: string, next: Partial<DebtTrade>) {
    onChange({
      debtTrades: trades.map((item) => (item.id === id ? { ...item, ...next } : item)),
    });
  }

  const body = (
      <div className="flex flex-col gap-md pb-md pt-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1360px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[76px]" />
              <col className="w-[188px]" />
              <col className="w-[70px]" />
              <col className="w-[188px]" />
              <col className="w-[140px]" />
              <col className="w-[140px]" />
              <col className="w-[140px]" />
              <col className="w-[140px]" />
              <col className="w-[140px]" />
              <col className="w-[140px]" />
              <col />
            </colgroup>
            <thead className="bg-gray-extra-light">
              <tr>
                <th className="h-11 border-b border-gray-light px-xl" />
                <Th>Creditor Name</Th>
                <Th>Type</Th>
                <Th>Description</Th>
                <Th align="right">Payment</Th>
                <Th align="right">Sys Pmt</Th>
                <Th align="right">Adj Pmt</Th>
                <Th align="right">Balance</Th>
                <Th align="right">Original Balance</Th>
                <Th>Reported</Th>
                <Th>ECOA</Th>
              </tr>
            </thead>
            <tbody>
              {trades.map((item) => {
                const adj = item.adjPayment ?? item.payment;
                const sys = item.sysPayment ?? item.payment;
                const original = item.originalBalance ?? item.highCredit;
                return (
                  <tr key={item.id} className="h-[62px]">
                    <td className="border-b border-gray-light px-xl py-md">
                      <TradeCheckbox
                        checked={item.includeInDti}
                        disabled={readOnly}
                        label={`Include ${item.category} in DTI`}
                        onChange={(includeInDti) =>
                          patchTrade(item.id, {
                            includeInDti,
                            adjPayment: includeInDti && !adj ? sys : adj,
                          })
                        }
                      />
                    </td>
                    <Td>{item.lender}</Td>
                    <Td>{item.accountType}</Td>
                    <Td>
                      <span className="block break-words whitespace-normal">{item.category}</span>
                    </Td>
                    <Td align="right">
                      {item.includeInDti && item.payment ? money(item.payment) : ""}
                    </Td>
                    <Td align="right">{money(sys)}</Td>
                    <td className="border-b border-gray-light px-xl py-md">
                      <AdjInput
                        value={adj}
                        disabled={readOnly}
                        ariaLabel={`${item.category} adjusted payment`}
                        onChange={(adjPayment) => patchTrade(item.id, { adjPayment })}
                      />
                    </td>
                    <Td align="right">{money(item.balance)}</Td>
                    <Td align="right">{money(original)}</Td>
                    <Td>{item.reportedAt || ""}</Td>
                    <Td>{item.ecoa || ""}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-md px-md">
          <Select
            aria-label="Primary Housing Expenses"
            disabled={readOnly}
            value={housingId}
            placeholder="Primary Housing Expenses"
            className="w-[401px] max-w-full"
            variant="box"
            triggerClassName="h-[60px]"
            options={[
              { id: "", label: "Primary Housing Expenses" },
              ...(application.borrower.livingArrangement === "Renting"
                ? [{ id: "rent", label: `Rent — ${money(application.income.housingPayment)}` }]
                : []),
              ...housingTrades.map((item) => ({
                id: item.id,
                label: `${item.category} — ${money(item.adjPayment ?? item.payment)}`,
              })),
            ]}
            onChange={(primaryHousingTradeId) =>
              onChange({
                underwriting: {
                  ...application.underwriting,
                  primaryHousingTradeId,
                },
              })
            }
          />
          <p className="flex items-center gap-xs text-xl font-semibold whitespace-nowrap text-black">
            <span>Total Monthly Liabilities:</span>
            <span>{money(total)}</span>
          </p>
        </div>
      </div>
  );

  if (!showHeader) return body;

  return (
    <div className="flex flex-col bg-white">
      <div className="uw-card-header">
        <h1 className="text-lg text-black">Credit Report Liabilities</h1>
        <div className="flex shrink-0 items-center gap-sm">
          <Button variant="secondary" onClick={() => exportLiabilities(application)}>
            Export to Excel
          </Button>
          <Link href={reportHref} className={buttonClass("primary")}>
            View Credit Report
          </Link>
        </div>
      </div>
      {body}
    </div>
  );
}

function Th({ children, align }: { children: string; align?: "right" }) {
  return (
    <th
      className={`h-11 border-b border-gray-light px-xl py-3 font-semibold whitespace-nowrap text-black ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

function Td({ children, align }: { children: ReactNode; align?: "right" }) {
  return (
    <td
      className={`border-b border-gray-light px-xl py-md text-sm text-gray-dark ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </td>
  );
}

function AdjInput({
  value,
  disabled,
  ariaLabel,
  onChange,
}: {
  value: number;
  disabled: boolean;
  ariaLabel: string;
  onChange: (value: number) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const display = focused ? draft : money(value);

  return (
    <input
      aria-label={ariaLabel}
      disabled={disabled}
      className="ml-auto block w-[105px] rounded-xs border border-gray-light bg-white px-3 py-xs text-right text-base text-gray-dark"
      value={display}
      onFocus={() => {
        setFocused(true);
        setDraft(value ? String(value) : "");
      }}
      onBlur={() => {
        setFocused(false);
        onChange(parseMoney(draft));
      }}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        onChange(parseMoney(next));
      }}
    />
  );
}

function TradeCheckbox({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex size-7 shrink-0 items-center justify-center rounded-[2px] border ${
        checked ? "border-primary bg-primary text-white" : "border-gray-dark bg-white"
      } disabled:opacity-50`}
    >
      {checked ? <CheckIcon /> : null}
    </button>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
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

function parseMoney(value: string) {
  const next = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(next) ? next : 0;
}
