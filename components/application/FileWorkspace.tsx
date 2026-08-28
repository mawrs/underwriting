"use client";

import { AuditPackage } from "@/components/application/AuditPackage";
import {
  FileWorkspaceContext,
  type FileMode,
  type FileWorkspaceValue,
} from "@/components/application/file-context";
import { StepFooter } from "@/components/application/StepFooter";
import { WorkflowNav } from "@/components/application/WorkflowNav";
import { useApplication } from "@/lib/store";

export type { FileMode };
export { useFileWorkspace } from "@/components/application/file-context";

export function FileWorkspace({
  id,
  mode,
  children,
}: {
  id: string;
  mode: FileMode;
  children: React.ReactNode;
}) {
  const { application, ready } = useApplication(id);

  if (!ready) {
    return <p className="p-md text-sm text-gray-medium">Loading application…</p>;
  }
  if (!application) {
    return <p className="p-md text-sm text-gray-medium">Application {id} was not found.</p>;
  }

  const readOnly =
    mode === "senior"
      ? application.status !== "senior-review"
      : application.status === "senior-review" || application.status === "approved";

  const value: FileWorkspaceValue = {
    id,
    mode,
    basePath: mode === "senior" ? `/senior-queue/${id}` : `/applications/${id}`,
    readOnly,
  };

  return (
    <FileWorkspaceContext.Provider value={value}>
      <div className="flex min-h-0 flex-1 flex-col">
        {application.status === "returned" && application.seniorNotes ? (
          <div className="border-b border-orange bg-orange-bg px-md py-sm text-sm text-orange-hover">
            Returned by senior: {application.seniorNotes}
          </div>
        ) : null}
        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[230px_minmax(0,1fr)_260px]">
          <WorkflowNav application={application} />
          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-md pt-lg xl:px-lg">
              {children}
            </div>
            <StepFooter />
          </div>
          <AuditPackage application={application} />
        </div>
      </div>
    </FileWorkspaceContext.Provider>
  );
}
