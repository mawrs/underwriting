"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";

export function TopNav() {
  const { resetStore } = useStore();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div className="border-b border-gray-lightest bg-white py-md">
      <div className="flex h-[42px] items-center justify-between px-2xl">
        <div className="flex items-center gap-md">
          <Link href="/queue" className="flex h-[42px] items-center" aria-label="elfi home">
            <img
              src="/brand/elfi-logo.png"
              alt="elfi, a division of SouthEast Bank"
              className="h-[42px] w-[63px] object-contain"
            />
          </Link>
          <span className="inline-flex items-center rounded-xs border border-warning bg-warning-bg px-sm py-[3px] text-xs font-semibold text-charcoal">
            Demo Application
          </span>
        </div>
        <div ref={root} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Signed in as John Doe"
            onClick={() => setOpen((next) => !next)}
            className="inline-flex items-center gap-sm rounded-xs px-[5px] py-[9px] text-sm font-semibold text-gray-dark hover:bg-gray-lightest"
          >
            John Doe
            <img src="/brand/chevron-down.svg" alt="" width={16} height={16} />
          </button>
          {open ? (
            <div
              role="menu"
              className="absolute top-[calc(100%+4px)] right-0 z-30 min-w-52 rounded-xs border border-gray-light bg-white py-xs shadow-[0px_1px_0.5px_0.05px_rgba(29,41,61,0.02)]"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-sm px-md py-sm text-left text-sm text-charcoal hover:bg-gray-lightest hover:outline hover:outline-1 hover:outline-primary"
                onClick={() => {
                  resetStore();
                  setOpen(false);
                }}
              >
                <ResetIcon />
                Reset demo data
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-gray-dark">
      <path
        d="M13.25 8A5.25 5.25 0 1 1 11.7 4.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M13.25 2.75v3.25h-3.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
