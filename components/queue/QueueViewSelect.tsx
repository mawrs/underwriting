"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUEUE_VIEWS, type QueueViewId } from "@/lib/queues";
import { useViewLabels } from "@/lib/view-labels";

export function QueueViewSelect({ value }: { value: QueueViewId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { labelFor } = useViewLabels();
  const selected = QUEUE_VIEWS.find((view) => view.id === value) ?? QUEUE_VIEWS[1];

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div ref={root} className="relative min-w-0 flex-1">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((next) => !next)}
        className="uw-list-field text-left"
      >
        <span className="min-w-0 flex-1 truncate">{labelFor(selected.id)}</span>
        <ChevronDownIcon />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+4px)] right-0 z-30 min-w-full rounded-xs border border-gray-light bg-white py-xs shadow-[0px_1px_0.5px_0.05px_rgba(29,41,61,0.02)]"
        >
          {QUEUE_VIEWS.map((view) => (
            <li key={view.id}>
              <button
                type="button"
                role="option"
                aria-selected={view.id === value}
                className={`block w-full px-md py-sm text-left text-sm text-charcoal hover:bg-gray-lightest hover:outline hover:outline-1 hover:outline-primary ${
                  view.id === value ? "bg-gray-lightest" : ""
                }`}
                onClick={() => {
                  setOpen(false);
                  router.push(`/queue?view=${view.id}`);
                }}
              >
                {labelFor(view.id)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden className="shrink-0 text-gray-dark">
      <path d="M9 12l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
