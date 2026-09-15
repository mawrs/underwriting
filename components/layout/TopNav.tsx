"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";

export function TopNav() {
  const { resetStore } = useStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const fileOpen = Boolean(pathname.match(/^\/(applications|senior-queue)\/[^/]+/));
  const workbookOpen = pathname.startsWith("/workbook") || pathname.startsWith("/view");
  const queueActive = !fileOpen && (pathname.startsWith("/queue") || pathname.startsWith("/senior-queue"));
  const searchActive = pathname.startsWith("/loan-search");

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

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
          {fileOpen || workbookOpen ? null : (
            <Suspense fallback={null}>
              <HeaderSearch />
            </Suspense>
          )}
        </div>
        <div ref={root} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Signed in as Casey Morrow"
            onClick={() => setOpen((next) => !next)}
            className="inline-flex items-center gap-xs rounded-xs px-[5px] py-[9px] text-sm font-semibold text-gray-dark hover:bg-gray-lightest"
          >
            Casey Morrow
            <img src="/brand/chevron-down.svg" alt="" width={16} height={16} />
          </button>
          {open ? (
            <div
              role="menu"
              className="absolute top-[calc(100%+4px)] right-0 z-30 min-w-52 border border-gray-light bg-white py-xs"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-sm px-md py-sm text-left text-sm text-charcoal hover:bg-gray-lightest"
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

function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = pathname.startsWith("/loan-search") ? (searchParams.get("q") ?? "") : "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  function clear() {
    setQuery("");
    if (pathname.startsWith("/loan-search")) router.push("/loan-search");
  }

  return (
    <form
      className="hidden md:block"
      onSubmit={(event) => {
        event.preventDefault();
        const next = query.trim();
        router.push(next ? `/loan-search?q=${encodeURIComponent(next)}` : "/loan-search");
      }}
    >
      <label className="flex h-[34px] w-[422px] max-w-[40vw] items-center gap-sm rounded-xs border border-gray-light bg-white px-md">
        <HeaderSearchIcon />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          className="h-4 min-w-0 flex-1 bg-transparent text-xs text-gray-dark outline-none placeholder:text-gray-dark"
        />
        {query ? (
          <button type="button" aria-label="Clear search" onClick={clear} className="text-gray-medium">
            <HeaderCloseIcon />
          </button>
        ) : null}
      </label>
    </form>
  );
}

function HeaderCloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HeaderSearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="shrink-0 text-gray-dark">
      <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 12l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
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
