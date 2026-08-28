"use client";

import { payoffDiscrepancy } from "@/lib/calculations";
import { money } from "@/lib/format";
import type { Application, Liability, PayoffType } from "@/lib/types";

export function PayoffTable({
  application,
  onChange,
  readOnly = false,
}: {
  application: Application;
  onChange: (next: Application["liabilities"]) => void;
  readOnly?: boolean;
}) {
  const selected = application.liabilities.filter((item) => item.selected);
  const sallieMae = selected.filter((item) =>
    item.lender.toUpperCase().includes("SALLIE"),
  );
  const discrepancies = sallieMae.filter(payoffDiscrepancy).length;

  function update(id: string, patch: Partial<Liability>) {
    onChange(
      application.liabilities.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    );
  }

  return (
    <div className="space-y-md">
      <div className="uw-card-pad">
        <h2 className="text-sm font-semibold text-navy">Sallie Mae cross-check</h2>
        <p className="mt-xs text-xs text-gray-medium">
          Compare credit-report balances with payoff amounts from the uploaded Sallie Mae documents.
          Flagged rows differ on creditor, account, or balance.
        </p>
        <p className="mt-sm text-sm">
          {sallieMae.length} Sallie Mae loan{sallieMae.length === 1 ? "" : "s"} selected ·{" "}
          {discrepancies} {discrepancies === 1 ? "discrepancy" : "discrepancies"}
        </p>
      </div>

      <div className="uw-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="uw-table-head">
              <tr>
                <th className="px-sm py-sm">Payoff</th>
                <th className="px-sm py-sm">Lender / account</th>
                <th className="px-sm py-sm">Source bal</th>
                <th className="px-sm py-sm">Adj. creditor</th>
                <th className="px-sm py-sm">Adj. account</th>
                <th className="px-sm py-sm">Adj. balance</th>
                <th className="px-sm py-sm">Type</th>
                <th className="px-sm py-sm">Confirmed</th>
              </tr>
            </thead>
            <tbody>
              {application.liabilities.map((item) => {
                const flagged = item.selected && payoffDiscrepancy(item);
                return (
                  <tr
                    key={item.id}
                    className={`border-t border-gray-light ${flagged ? "bg-warning-bg" : ""}`}
                  >
                    <td className="px-sm py-sm">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        disabled={readOnly}
                        onChange={(event) =>
                          update(item.id, { selected: event.target.checked })
                        }
                      />
                    </td>
                    <td className="px-sm py-sm">
                      <div className="font-semibold">{item.lender}</div>
                      <div className="text-xs text-gray-medium">
                        {item.accountNumber} · pmt {money(item.payment)}
                      </div>
                    </td>
                    <td className="px-sm py-sm">{money(item.balance)}</td>
                    <td className="px-sm py-sm">
                      <Field
                        readOnly={readOnly}
                        value={item.adjCreditorName}
                        onChange={(value) => update(item.id, { adjCreditorName: value })}
                      />
                    </td>
                    <td className="px-sm py-sm">
                      <Field
                        readOnly={readOnly}
                        value={item.adjAccountNumber}
                        onChange={(value) => update(item.id, { adjAccountNumber: value })}
                      />
                    </td>
                    <td className="px-sm py-sm">
                      <Field
                        readOnly={readOnly}
                        type="number"
                        value={String(item.adjBalance)}
                        onChange={(value) =>
                          update(item.id, { adjBalance: Number(value) || 0 })
                        }
                      />
                    </td>
                    <td className="px-sm py-sm">
                      {readOnly ? (
                        item.payoffType
                      ) : (
                        <select
                          className="uw-input"
                          value={item.payoffType}
                          onChange={(event) =>
                            update(item.id, {
                              payoffType: event.target.value as PayoffType,
                            })
                          }
                        >
                          <option value="full">Full</option>
                          <option value="partial">Partial</option>
                        </select>
                      )}
                    </td>
                    <td className="px-sm py-sm">
                      <input
                        type="checkbox"
                        checked={item.confirmed}
                        disabled={readOnly || !item.selected}
                        onChange={(event) =>
                          update(item.id, { confirmed: event.target.checked })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-light px-md py-sm text-sm">
          <span className="font-semibold">{selected.length} loan(s) selected</span>
          <span className="ml-md text-gray-medium">
            Total amount to be paid off{" "}
            {money(selected.reduce((sum, item) => sum + item.adjBalance, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({
  value,
  onChange,
  readOnly,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  type?: string;
}) {
  if (readOnly) return <span>{value}</span>;
  return (
    <input
      type={type}
      className="uw-input w-36"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
