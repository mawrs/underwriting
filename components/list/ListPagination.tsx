export function ListPagination({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-md px-xl py-lg">
      <p className="text-sm text-gray-dark">
        1 - {count} of {count} items
      </p>
      <div className="flex items-center gap-sm">
        <span className="inline-flex h-[38px] w-14 items-center justify-center rounded-xs border border-gray-light bg-white text-gray-dark">
          <ChevronsLeft />
        </span>
        <span className="inline-flex h-[38px] items-center justify-center rounded-xs bg-primary px-[21px] text-sm font-semibold text-white">
          1
        </span>
        <span className="inline-flex h-[38px] w-[50px] items-center justify-center rounded-xs border border-gray-light bg-white text-sm text-gray-dark">
          2
        </span>
        <span className="inline-flex h-[38px] w-[50px] items-center justify-center rounded-xs border border-gray-light bg-white text-sm text-gray-dark">
          3
        </span>
        <span className="inline-flex h-[38px] w-[50px] items-center justify-center rounded-xs border border-gray-light bg-white text-sm text-gray-dark">
          4
        </span>
        <span className="inline-flex h-[38px] w-[50px] items-center justify-center rounded-xs border border-gray-light bg-white text-sm text-gray-dark">
          5
        </span>
        <span className="inline-flex h-[38px] w-14 items-center justify-center rounded-xs border border-gray-light bg-white text-gray-dark">
          <ChevronsRight />
        </span>
      </div>
    </div>
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
