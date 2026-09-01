"use client";

import { useFileWorkspace } from "@/components/application/file-context";
import { StageIntro } from "@/components/application/StageIntro";
import { IncomeForm } from "@/components/underwriting/IncomeForm";
import { RatesTable } from "@/components/underwriting/RatesTable";
import { useApplication } from "@/lib/store";

export function UnderwritingPage() {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;

  return (
    <StageIntro
      title="Underwriting"
      lede="Verify pay, then pick a term. The DTI row updates from remaining credit-report trades plus the new payment."
    >
      <div className="space-y-lg">
        <RatesTable
          application={application}
          readOnly={readOnly}
          onSelect={(patch) => updateApplication(id, patch)}
        />
        <IncomeForm
          application={application}
          readOnly={readOnly}
          onChange={(patch) => updateApplication(id, patch)}
        />
      </div>
    </StageIntro>
  );
}
