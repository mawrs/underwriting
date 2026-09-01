"use client";

import { useFileWorkspace } from "@/components/application/file-context";
import { StageIntro } from "@/components/application/StageIntro";
import { LoanCard } from "@/components/payoffs/LoanCard";
import { FlagList } from "@/components/shared/FlagLine";
import { selectedPayoffTotal } from "@/lib/calculations";
import { money } from "@/lib/format";
import { emptyStudentLoan, isStudentLoan, normalizeLiability } from "@/lib/payoffs";
import { useApplication } from "@/lib/store";
import type { Liability } from "@/lib/types";
import { stepFlags } from "@/lib/workflow";

export function PayoffsPage({ mode = "all" }: { mode?: "all" | "payoff" }) {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;
  const file = application;

  const studentLoans = file.liabilities.map(normalizeLiability).filter(isStudentLoan);
  const loans = mode === "payoff" ? studentLoans.filter((item) => item.selected) : studentLoans;
  const selected = studentLoans.filter((item) => item.selected);

  function setLiabilities(next: Liability[]) {
    updateApplication(id, { liabilities: next.map(normalizeLiability) });
  }

  function update(loanId: string, patch: Partial<Liability>) {
    setLiabilities(file.liabilities.map((item) => (item.id === loanId ? { ...item, ...patch } : item)));
  }

  return (
    <div className="flex min-h-full flex-col">
      <StageIntro title={mode === "payoff" ? "Loan Payoff" : "Student Loan Liabilities"}>
        {mode === "all" ? (
          <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
            <div>
              <h2 className="text-xl font-semibold text-black">Which loan(s) do you want to pay off?</h2>
              <p className="mt-xs max-w-[62ch] text-sm text-gray-medium">
                Student loans from the credit report appear below. Select the ones this refinance will pay off.
              </p>
            </div>
            <button
              type="button"
              className="uw-btn-secondary"
              disabled={readOnly}
              onClick={() => setLiabilities([...file.liabilities, emptyStudentLoan()])}
            >
              Add Other Student Loan
            </button>
          </div>
        ) : null}

        {loans.length === 0 ? (
          <p className="text-sm text-gray-medium">
            {mode === "payoff"
              ? "No loans are selected for payoff. Choose them on Student Loan Liabilities."
              : "No student loans are on this file."}
          </p>
        ) : (
          <div className="flex flex-col gap-md">
            {loans.map((item) => (
              <LoanCard
                key={item.id}
                item={item}
                variant={mode}
                readOnly={readOnly}
                onChange={(patch) => update(item.id, patch)}
              />
            ))}
          </div>
        )}

        <div className="mt-lg">
          <FlagList flags={stepFlags(file, "payoffs")} />
        </div>
      </StageIntro>

      {mode === "payoff" ? (
        <footer className="sticky bottom-0 mt-auto border-t border-gray-light bg-white px-xl py-md">
          <div className="flex items-end justify-between gap-md">
            <div>
              <p className="text-sm text-gray-medium">Total amount to be paid off</p>
              <p className="text-2xl font-semibold text-black">{money(selectedPayoffTotal(selected))}</p>
            </div>
            <p className="text-sm text-gray-medium">
              {selected.length} loan(s) selected
            </p>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
