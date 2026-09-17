"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { useStore } from "@/lib/store";

export function TopNav() {
  const { resetStore } = useStore();
  const pathname = usePathname();
  const fileOpen = Boolean(pathname.match(/^\/(applications|senior-queue)\/[^/]+/));
  const queueActive = !fileOpen && (pathname.startsWith("/queue") || pathname.startsWith("/senior-queue"));
  const searchActive = pathname.startsWith("/loan-search");

  return (
    <div className="border-b border-gray-lightest bg-white py-sm">
      <div className="flex h-[74px] items-center justify-between px-xl">
        <div className="flex items-center gap-xl">
          <div className="flex items-center gap-md">
            <Link href="/queue" className="flex h-11 items-center" aria-label="elfi home">
              <img
                src="/brand/elfi-logo.png"
                alt="elfi, a division of SouthEast Bank"
                className="h-11 w-[66px] object-contain"
              />
            </Link>
          </div>
          <nav className="flex items-center">
            <Link
              href="/queue"
              className={navClass("left", queueActive)}
              aria-current={queueActive ? "page" : undefined}
            >
              <CalendarIcon />
              Queue
            </Link>
            <Link
              href="/loan-search"
              className={navClass("right", searchActive)}
              aria-current={searchActive ? "page" : undefined}
            >
              <SearchIcon />
              Loan Search
            </Link>
          </nav>
        </div>
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              aria-label="Signed in as Casey Morrow"
              className="inline-flex items-center gap-xs rounded-xs px-[5px] py-[9px] text-sm font-semibold text-gray-dark hover:bg-gray-lightest"
            >
              Casey Morrow
              <img src="/brand/chevron-down.svg" alt="" width={16} height={16} />
            </button>
          }
        >
          {({ close }) => (
            <DropdownItem
              onClick={() => {
                resetStore();
                close();
              }}
            >
              <span className="flex items-center gap-sm">
                <ResetIcon />
                Reset demo data
              </span>
            </DropdownItem>
          )}
        </Dropdown>
      </div>
    </div>
  );
}

function navClass(side: "left" | "right", active: boolean) {
  return [
    "inline-flex items-center gap-xs px-[17px] py-[9px] text-xs",
    side === "left" ? "rounded-l-xs" : "rounded-r-xs border-l-0",
    active
      ? "border border-primary bg-primary text-white"
      : "border border-gray-light bg-white text-gray-dark hover:text-primary",
  ].join(" ");
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 6.5h11" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.25 2.25v2M10.75 2.25v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.25 10.25L13.5 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
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
