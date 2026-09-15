"use client";

import { useFileWorkspace } from "@/components/application/file-context";
import { UnderwritingLiabilities } from "@/components/underwriting/UnderwritingLiabilities";
import { useApplication } from "@/lib/store";

export function DtiPage() {
  const { id, basePath, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;

  return (
    <UnderwritingLiabilities
      application={application}
      readOnly={readOnly}
      basePath={basePath}
      showHeader
      onChange={(patch) => updateApplication(id, patch)}
    />
  );
}
