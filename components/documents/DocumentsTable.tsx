"use client";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { shortDate } from "@/lib/format";
import type { Application, DocumentStatus } from "@/lib/types";
import { requiredDocument } from "@/lib/workflow";

const statuses: DocumentStatus[] = [
  "pending",
  "submitted",
  "approved",
  "rejected",
  "incomplete",
];

export function DocumentsTable({
  application,
  onChange,
  readOnly = false,
}: {
  application: Application;
  onChange: (next: Application["documents"]) => void;
  readOnly?: boolean;
}) {
  function update(id: string, patch: Partial<Application["documents"][number]>) {
    onChange(
      application.documents.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              ...patch,
              reviewedAt:
                patch.reviewStatus && patch.reviewStatus !== "pending"
                  ? new Date().toISOString()
                  : doc.reviewedAt,
            }
          : doc,
      ),
    );
  }

  return (
    <div className="uw-card">
      <div className="border-b border-gray-light px-md py-sm">
        <h2 className="text-sm font-semibold text-navy">Uploaded documents</h2>
        <p className="text-xs text-gray-medium">
          Cross-check KYC, credit, degree, and income documents. Saving a status does not send a letter.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="uw-table-head">
            <tr>
              <th className="px-sm py-sm">Document</th>
              <th className="px-sm py-sm">Type</th>
              <th className="px-sm py-sm">File</th>
              <th className="px-sm py-sm">Uploaded</th>
              <th className="px-sm py-sm">Status</th>
              <th className="px-sm py-sm">Note</th>
            </tr>
          </thead>
          <tbody>
            {application.documents.map((doc) => (
              <tr key={doc.id} className="border-t border-gray-light align-top">
                <td className="px-sm py-sm">
                  <div className="flex flex-wrap items-center gap-sm">
                    <span className="font-semibold">{doc.name}</span>
                    <span
                      className={`rounded-xs px-[7px] py-px text-[11px] ${
                        requiredDocument(doc.kind)
                          ? "bg-error-bg text-error"
                          : "bg-gray-lightest text-gray-medium"
                      }`}
                    >
                      {requiredDocument(doc.kind) ? "Required" : "Optional"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-medium">{doc.description}</div>
                </td>
                <td className="px-sm py-sm">{doc.typeLabel}</td>
                <td className="px-sm py-sm text-primary">{doc.fileName}</td>
                <td className="px-sm py-sm text-xs text-gray-medium">
                  {shortDate(doc.uploadedAt)}
                </td>
                <td className="px-sm py-sm">
                  {readOnly ? (
                    <StatusBadge value={doc.reviewStatus} />
                  ) : (
                    <select
                      className="uw-input"
                      value={doc.reviewStatus}
                      onChange={(event) =>
                        update(doc.id, {
                          reviewStatus: event.target.value as DocumentStatus,
                        })
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-sm py-sm">
                  {readOnly ? (
                    <span className="text-gray-dark">{doc.note || "—"}</span>
                  ) : (
                    <input
                      className="uw-input w-56"
                      value={doc.note}
                      onChange={(event) => update(doc.id, { note: event.target.value })}
                      placeholder="Reviewer observation"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
