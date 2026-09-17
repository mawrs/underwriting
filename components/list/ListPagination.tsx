"use client";

import { useState, type ReactNode } from "react";

export const LIST_PAGE_SIZE = 10;

export function usePagedList<T>(items: T[], pageSize = LIST_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  if (page !== currentPage) setPage(currentPage);

  const start = items.length === 0 ? 0 : (currentPage - 1) * pageSize;
  return {
    page: currentPage,
    setPage,
    pageSize,
    pageItems: items.slice(start, start + pageSize),
    count: items.length,
  };
}

export function ListPagination({
  count,
  page,
  pageSize = LIST_PAGE_SIZE,
  onPageChange,
}: {
  count: number;
  page: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}) {
  if (count === 0) return null;

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, count);
  const pages = visiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-md px-xl py-lg">
      <p className="text-sm text-gray-dark">
        {start} - {end} of {count} items
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-sm">
        <PagerButton
          label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          wide
        >
          <ChevronsLeft />
        </PagerButton>
        {pages.map((pageNumber) => {
          const active = pageNumber === currentPage;
          return (
            <PagerButton
              key={pageNumber}
              label={`Page ${pageNumber}`}
              active={active}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </PagerButton>
          );
        })}
        <PagerButton
          label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          wide
        >
          <ChevronsRight />
        </PagerButton>
      </nav>
    </div>
  );
}

function visiblePages(current: number, total: number, max = 5) {
  if (total <= max) return Array.from({ length: total }, (_, index) => index + 1);
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function PagerButton({
  children,
  label,
  onClick,
  active = false,
  disabled = false,
  wide = false,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex h-[38px] items-center justify-center rounded-xs text-sm",
        wide ? "w-14" : "min-w-[50px] px-[21px]",
        active
          ? "bg-primary font-semibold text-white"
          : "border border-gray-light bg-white text-gray-dark",
        disabled ? "opacity-40" : !active ? "hover:bg-gray-lightest" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ChevronsLeft() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden>
      <path d="M7 1.5L2 6l5 4.5M12 1.5L7 6l5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronsRight() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden>
      <path d="M2 1.5L7 6l-5 4.5M7 1.5L12 6l-5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
