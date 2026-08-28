"use client";

import { useFileWorkspace } from "@/components/application/file-context";
import { StageIntro } from "@/components/application/StageIntro";
import { IncomeForm } from "@/components/underwriting/IncomeForm";
import { useApplication } from "@/lib/store";

export function IncomePage() {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;

  return (
    <div>
      <StageIntro
        title="Income"
        lede="Enter it once. This feeds the DTI calculation, the XLS, and the PDF."
      />
      <IncomeForm
        application={application}
        readOnly={readOnly}
        onChange={(patch) => updateApplication(id, patch)}
      />
    </div>
  );
}
