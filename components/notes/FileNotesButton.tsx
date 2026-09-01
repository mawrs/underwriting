"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NotesPanel, notesFilledCount, NOTE_FIELDS } from "@/components/notes/NotesPanel";
import { useApplication } from "@/lib/store";

export function FileNotesButton({ id }: { id: string }) {
  const pathname = usePathname();
  const { application, updateApplication } = useApplication(id);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!application) return null;

  const filled = notesFilledCount(application.notes);
  const senior = pathname.startsWith("/senior-queue");
  const readOnly = senior
    ? application.status !== "senior-review"
    : application.status === "senior-review" || application.status === "approved";

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((next) => !next)}
        className={`inline-flex items-center gap-xs text-sm ${
          open ? "font-semibold text-primary" : "text-gray-medium hover:text-primary"
        }`}
      >
        Notes
        <span className="text-xs">
          {filled}/{NOTE_FIELDS.length}
        </span>
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Comments"
          className="absolute top-[calc(100%+8px)] right-0 z-30 w-[min(32rem,calc(100vw-4rem))] rounded-xs border border-gray-light bg-white shadow-[0px_1px_0.5px_0.05px_rgba(29,41,61,0.02)]"
        >
          <div className="border-b border-gray-light px-md py-sm">
            <div className="text-sm font-semibold text-navy">Comments</div>
            <p className="text-xs text-gray-medium">
              On the record for the PDF and second-level review.
            </p>
          </div>
          <div className="max-h-[min(70vh,36rem)] overflow-y-auto p-md">
            <NotesPanel
              application={application}
              readOnly={readOnly}
              onChange={(notes) => updateApplication(id, { notes })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
