"use client";

import { exportPdf } from "@/lib/export/pdf";
import { exportWorkbook } from "@/lib/export/xlsx";
import { seniorChanges } from "@/lib/diffs";
import { packageLines } from "@/lib/workflow";
import type { Application } from "@/lib/types";
import { useFileWorkspace } from "@/components/application/file-context";

export function AuditPackage({ application }: { application: Application }) {
  const { mode } = useFileWorkspace();
  const lines = packageLines(application);
  const changes = mode === "senior" ? seniorChanges(application) : [];

  return (
    <aside className="border-t border-gray-light bg-white xl:border-t-0 xl:border-l">
      <div className="h-full overflow-y-auto py-sm">
        <h2 className="px-md pb-sm text-[11px] font-semibold tracking-[0.08em] text-gray-medium uppercase">
          Audit package
        </h2>
        <div className="px-md">
          {lines.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-sm border-b border-gray-lightest py-[5px] text-sm"
            >
              <span className="text-gray-medium">{label}</span>
              <span className="text-right font-medium text-charcoal">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-md grid gap-sm px-md">
          <button type="button" className="uw-btn-secondary" onClick={() => exportWorkbook(application)}>
            Export XLS
          </button>
          <button type="button" className="uw-btn-secondary" onClick={() => exportPdf(application)}>
            Export PDF
          </button>
        </div>
        <p className="mt-md border-t border-dashed border-gray-light px-md pt-sm text-[11.5px] leading-md text-gray-medium">
          Entered once here and written to both files. Exporting does not notify the applicant.
        </p>
        {changes.length > 0 ? (
          <div className="mt-md border-t border-dashed border-gray-light px-md pt-sm">
            <h3 className="text-[11px] font-semibold tracking-[0.08em] text-gray-medium uppercase">
              Changes at second level
            </h3>
            <ul className="mt-sm space-y-xs text-xs text-gray-dark">
              {changes.map((change) => (
                <li key={change.path}>
                  <span className="font-semibold text-orange">{change.label}:</span>{" "}
                  {change.before} → {change.after}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
