"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApplication, useStore } from "@/lib/store";
import { canSubmitToSenior } from "@/lib/validation";
import { Button, buttonClass } from "@/components/ui/Button";

export function FileActions({ id }: { id: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const senior = pathname.startsWith("/senior-queue");
  const basePath = senior ? `/senior-queue/${id}` : `/applications/${id}`;
  const { application } = useApplication(id);
  const { submitToSenior, completeSeniorReview, updateApplication } = useStore();
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

  if (!application) return null;

  return (
    <div className="flex items-center gap-sm">
      <Link href={`${basePath}/review`} className={buttonClass("secondary")}>
        New Review
      </Link>
      <div ref={root} className="relative">
        <Button
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((next) => !next)}
        >
          {senior ? "Complete Review" : "Submit for Approval"}
          <ChevronDownIcon />
        </Button>
        {open ? (
          <div
            role="menu"
            className="absolute top-[calc(100%+4px)] right-0 z-30 min-w-52 border border-gray-light bg-white py-xs"
          >
            {senior ? (
              <>
                <MenuItem
                  onClick={() => {
                    completeSeniorReview(id, "approve");
                    setOpen(false);
                    router.push("/senior-queue");
                  }}
                >
                  Complete second-level review
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    completeSeniorReview(id, "return-to-uw");
                    setOpen(false);
                    router.push("/queue");
                  }}
                >
                  Return to underwriter
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem
                  disabled={!canSubmitToSenior(application)}
                  onClick={() => {
                    if (!canSubmitToSenior(application)) {
                      router.push(`${basePath}/submit`);
                      setOpen(false);
                      return;
                    }
                    submitToSenior(id);
                    setOpen(false);
                    router.push(application.decision === "needs-docs" ? "/queue" : "/senior-queue");
                  }}
                >
                  Submit for Approval
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    updateApplication(id, { decision: "needs-docs" });
                    setOpen(false);
                    router.push(`${basePath}/submit`);
                  }}
                >
                  Needs documentation
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setOpen(false);
                    router.push(`${basePath}/submit`);
                  }}
                >
                  Open completion checklist
                </MenuItem>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className="flex w-full px-md py-sm text-left text-sm text-charcoal hover:bg-gray-lightest disabled:cursor-not-allowed disabled:text-gray-medium"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
