"use client";

import { useFileWorkspace } from "@/components/application/file-context";
import { StageIntro } from "@/components/application/StageIntro";
import { FlagList } from "@/components/shared/FlagLine";
import { PayoffTable } from "@/components/payoffs/PayoffTable";
import { useApplication } from "@/lib/store";
import { stepFlags } from "@/lib/workflow";

export function PayoffsPage() {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;

  return (
    <div className="space-y-md">
      <StageIntro
        title="Liabilities and payoffs"
        lede="Loans the applicant selected for payoff. Payoff amounts get cross-checked against the servicer statement, not only the credit report."
      />
      <PayoffTable
        application={application}
        readOnly={readOnly}
        onChange={(liabilities) => updateApplication(id, { liabilities })}
      />
      <FlagList flags={stepFlags(application, "payoffs")} />
    </div>
  );
}
