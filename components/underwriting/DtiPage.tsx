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
    <StageIntro
      title="Credit Report Liabilities"
      lede="Trade lines still on the credit report after selected student-loan payoffs. These payments stay in DTI."
    >
      <DebtForm
        application={application}
        readOnly={readOnly}
        onChange={(patch) => updateApplication(id, patch)}
      />
    </StageIntro>
  );
}
