"use client";

import { useFileWorkspace } from "@/components/application/file-context";
import { StageIntro } from "@/components/application/StageIntro";
import { DebtForm } from "@/components/underwriting/DebtForm";
import { useApplication } from "@/lib/store";

export function DtiPage() {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;

  return (
    <div>
      <StageIntro
        title="Borrower debt and DTI"
        lede="Trade lines come off the credit report. The new loan payment comes from the payoff total and proposed terms."
      />
      <DebtForm
        application={application}
        readOnly={readOnly}
        onChange={(patch) => updateApplication(id, patch)}
      />
    </div>
  );
}
