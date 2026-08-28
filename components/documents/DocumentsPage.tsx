"use client";

import { useFileWorkspace } from "@/components/application/file-context";
import { StageIntro } from "@/components/application/StageIntro";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { FlagList } from "@/components/shared/FlagLine";
import { useApplication } from "@/lib/store";
import { stepFlags } from "@/lib/workflow";

export function DocumentsPage() {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;

  return (
    <div className="space-y-md">
      <StageIntro
        title="Documents"
        lede="Cross-check every upload before anything downstream gets entered. What you mark here decides what the rest of the flow lets you confirm."
      />
      <DocumentsTable
        application={application}
        readOnly={readOnly}
        onChange={(documents) => updateApplication(id, { documents })}
      />
      <FlagList flags={stepFlags(application, "documents")} />
    </div>
  );
}
