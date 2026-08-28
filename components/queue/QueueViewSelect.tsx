"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QUEUE_VIEWS, type QueueViewId } from "@/lib/queues";

export function QueueViewSelect({ value }: { value: QueueViewId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
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
    <div ref={root} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((next) => !next)}
        className="inline-flex h-[38px] max-w-80 items-center gap-sm rounded-xs border border-gray-medium px-md text-sm font-semibold text-gray-medium"
      >
        <span className="truncate">{selected.label}</span>
        <ChevronDownIcon />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+4px)] right-0 z-30 min-w-80 rounded-xs border border-gray-light bg-white py-xs shadow-[0px_1px_0.5px_0.05px_rgba(29,41,61,0.02)]"
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
                {view.label}
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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
