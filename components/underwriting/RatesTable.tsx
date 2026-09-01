"use client";

import { dtiForPayment, marginFor, paymentFor, RATE_TERMS, rateFor, type RateKind } from "@/lib/calculations/rates";
import { money, percent } from "@/lib/format";
import type { Application } from "@/lib/types";

export function RatesTable({
  application,
  onSelect,
  readOnly = false,
}: {
  application: Application;
  onSelect?: (patch: {
    requestedTerm: number;
    requestedRateType: RateKind;
    income: Application["income"];
  }) => void;
  readOnly?: boolean;
}) {
  function select(kind: RateKind, term: (typeof RATE_TERMS)[number]) {
    const payment = paymentFor(application, kind, term);
    if (payment == null || readOnly || !onSelect) return;
    onSelect({
      requestedTerm: term,
      requestedRateType: kind,
      income: { ...application.income, estimatedNewPayment: payment },
    });
  }

  return (
    <div className="uw-card">
      <div className="flex flex-wrap items-center justify-between gap-md px-md py-sm">
        <select className="uw-input" defaultValue="Immediate" disabled={readOnly}>
          <option>Immediate</option>
        </select>
        <span className="text-sm text-gray-medium">Index 6.75</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-center text-sm">
          <thead>
            <tr className="border-t border-gray-light text-gray-dark">
              <th className="px-sm py-sm text-left font-semibold">Rate Type</th>
              {RATE_TERMS.map((term) => (
                <th key={term} colSpan={2} className="px-sm py-sm font-semibold">
                  {term}
                </th>
              ))}
            </tr>
            <tr className="text-xs text-gray-medium">
              <th />
              {RATE_TERMS.map((term) => (
                <FragmentPair key={term} />
              ))}
            </tr>
          </thead>
          <tbody>
            <RateRow
              label="FIXED"
              kind="Fixed"
              application={application}
              onSelect={select}
            />
            <MetricRow
              label="DTI / Total liabilities"
              kind="Fixed"
              application={application}
            />
            <MarginRow />
            <RateRow
              label="VARIABLE"
              kind="Variable"
              application={application}
              onSelect={select}
            />
            <MetricRow
              label="DTI / Total liabilities"
              kind="Variable"
              application={application}
            />
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-md border-t border-gray-light px-md py-sm text-sm">
        <span className="text-gray-medium">Loan Amount</span>
        <span className="font-semibold">{money(application.amount)}</span>
        <span className="text-gray-medium">Selected</span>
        <span className="font-semibold">
          {application.requestedRateType} {application.requestedTerm} mo ·{" "}
          {money(application.income.estimatedNewPayment)}
        </span>
      </div>
    </div>
  );
}

function FragmentPair() {
  return (
    <>
      <th className="px-sm py-xs font-normal">Rate</th>
      <th className="px-sm py-xs font-normal">P & I Pmt.</th>
    </>
  );
}

function RateRow({
  label,
  kind,
  application,
  onSelect,
}: {
  label: string;
  kind: RateKind;
  application: Application;
  onSelect: (kind: RateKind, term: (typeof RATE_TERMS)[number]) => void;
}) {
  return (
    <tr className="border-t border-gray-light">
      <td className="px-sm py-sm text-left font-semibold">{label}</td>
      {RATE_TERMS.map((term) => {
        const rate = rateFor(kind, term);
        const payment = paymentFor(application, kind, term);
        const selected =
          application.requestedRateType === kind && application.requestedTerm === term;
        return (
          <CellPair
            key={`${kind}-${term}`}
            selected={selected}
            left={rate == null ? "—" : (rate * 100).toFixed(2)}
            right={payment == null ? "—" : payment.toFixed(2)}
            onClick={() => onSelect(kind, term)}
          />
        );
      })}
    </tr>
  );
}

function MetricRow({
  label,
  kind,
  application,
}: {
  label: string;
  kind: RateKind;
  application: Application;
}) {
  return (
    <tr className="border-t border-gray-lightest text-gray-dark">
      <td className="px-sm py-sm text-left">{label}</td>
      {RATE_TERMS.map((term) => {
        const payment = paymentFor(application, kind, term);
        const dti = dtiForPayment(application, payment);
        const paidOffIds = new Set(
          application.liabilities.filter((item) => item.selected).map((item) => item.id),
        );
        const remaining = application.debtTrades
          .filter((trade) => trade.includeInDti && !paidOffIds.has(trade.id))
          .reduce((sum, trade) => sum + trade.payment, 0);
        const liabilities =
          payment == null ? null : remaining + (application.income.housingPayment || 0) + payment;
        const selected =
          application.requestedRateType === kind && application.requestedTerm === term;
        return (
          <CellPair
            key={`${kind}-dti-${term}`}
            selected={selected}
            left={dti == null ? "—" : (dti * 100).toFixed(2)}
            right={liabilities == null ? "—" : liabilities.toFixed(2)}
          />
        );
      })}
    </tr>
  );
}

function MarginRow() {
  return (
    <tr className="border-t border-gray-lightest text-gray-dark">
      <td className="px-sm py-sm text-left">MARGIN</td>
      {RATE_TERMS.map((term) => {
        const margin = marginFor(term);
        return (
          <CellPair
            key={`margin-${term}`}
            left={margin == null ? "—" : (margin * 100).toFixed(2)}
            right="—"
          />
        );
      })}
    </tr>
  );
}

function CellPair({
  left,
  right,
  selected,
  onClick,
}: {
  left: string;
  right: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  const box = selected ? "rounded-xs border border-primary px-xs py-[3px]" : "px-xs py-[3px]";
  return (
    <>
      <td className="px-sm py-sm">
        {onClick && left !== "—" ? (
          <button type="button" className={box} onClick={onClick}>
            {left}
          </button>
        ) : (
          <span className={box}>{left}</span>
        )}
      </td>
      <td className="px-sm py-sm">
        {onClick && right !== "—" ? (
          <button type="button" className={box} onClick={onClick}>
            {right}
          </button>
        ) : (
          <span className={box}>{right}</span>
        )}
      </td>
    </>
  );
}
