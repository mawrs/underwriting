"use client";

import { useEffect } from "react";
import { estDateTime, titleCase } from "@/lib/format";
import { useApplication } from "@/lib/store";

export function DocumentViewer({ id, docId }: { id: string; docId: string }) {
  const { application, ready } = useApplication(id);
  const doc = application?.documents.find((item) => item.id === docId);

  useEffect(() => {
    if (!doc) return;
    document.title = doc.fileName;
  }, [doc]);

  if (!ready) {
    return <p className="p-xl text-sm text-gray-medium">Loading document…</p>;
  }
  if (!application || !doc) {
    return <p className="p-xl text-sm text-gray-medium">Document was not found.</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray-lightest">
      <div className="border-b border-gray-light bg-white px-xl py-md">
        <p className="text-lg text-black">{doc.name}</p>
        <p className="text-sm text-gray-dark">
          {application.borrower.fullName} · {application.id}
        </p>
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-auto p-xl">
        <article className="h-fit w-full max-w-[816px] bg-white px-[72px] py-[72px] shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
          <p className="text-xs tracking-[0.08em] text-gray-medium uppercase">
            {doc.typeLabel}
          </p>
          <h1 className="mt-sm text-2xl font-semibold text-black">{doc.name}</h1>
          <p className="mt-xs text-sm text-gray-dark">{doc.fileName}</p>
          {doc.description ? (
            <p className="mt-md text-sm text-gray-dark">{doc.description}</p>
          ) : null}
          <dl className="mt-xl grid grid-cols-2 gap-x-xl gap-y-md text-sm">
            <div>
              <dt className="text-gray-medium">Uploaded (EST)</dt>
              <dd className="text-charcoal">{estDateTime(doc.uploadedAt) || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-medium">Reviewed (EST)</dt>
              <dd className="text-charcoal">{estDateTime(doc.reviewedAt) || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-medium">Status</dt>
              <dd className="text-charcoal">
                {doc.reviewStatus === "pending"
                  ? doc.sourceStatus || "—"
                  : titleCase(doc.reviewStatus)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-medium">Internal</dt>
              <dd className="text-charcoal">{doc.internal ? "Y" : "N"}</dd>
            </div>
          </dl>
        </article>
      </div>
    </div>
  );
}
