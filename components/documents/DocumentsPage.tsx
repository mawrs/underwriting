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
    <StageIntro
      title="Documents"
      lede="Cross-check uploads. Status changes stay on the file and do not send a customer letter."
    >
      <div className="mb-md flex flex-wrap gap-sm">
        <button type="button" className="uw-btn-primary" disabled>
          Upload Files
        </button>
        <button
          type="button"
          className="uw-btn-primary"
          disabled={readOnly}
          onClick={() =>
            updateApplication(id, {
              documents: application.documents.map((doc) =>
                doc.reviewStatus === "pending" ? { ...doc, reviewStatus: "approved" as const } : doc,
              ),
            })
          }
        >
          Approve pending
        </button>
        <button
          type="button"
          className="uw-btn-primary"
          disabled={readOnly}
          onClick={() =>
            updateApplication(id, {
              documents: application.documents.map((doc) =>
                doc.reviewStatus === "pending" ? { ...doc, reviewStatus: "rejected" as const } : doc,
              ),
            })
          }
        >
          Reject pending
        </button>
        <button
          type="button"
          className="uw-btn-primary"
          disabled={readOnly}
          onClick={() =>
            updateApplication(id, {
              documents: application.documents.map((doc) =>
                doc.reviewStatus === "pending"
                  ? { ...doc, reviewStatus: "incomplete" as const }
                  : doc,
              ),
            })
          }
        >
          Mark pending incomplete
        </button>
      </div>
      <DocumentsTable
        application={application}
        readOnly={readOnly}
        onChange={(documents) => updateApplication(id, { documents })}
      />
      <FlagList flags={stepFlags(application, "documents")} />
    </StageIntro>
  );
}
