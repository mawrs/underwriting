"use client";

import { useFileWorkspace } from "@/components/application/file-context";
import { StageIntro } from "@/components/application/StageIntro";
import { RatesTable } from "@/components/underwriting/RatesTable";
import { useApplication } from "@/lib/store";

export function RatesPage() {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;

  return (
    <StageIntro
      title="Rates"
      lede="Same grid as underwriting. Select a cell to set term, rate type, and estimated P&I."
    >
      <RatesTable
        application={application}
        readOnly={readOnly}
        onSelect={(patch) => updateApplication(id, patch)}
      />
    </StageIntro>
  );
}
