"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileTabs } from "@/components/application/FileTabs";
import { TopNav } from "@/components/layout/TopNav";
import { OpenWorkbookButton } from "@/components/workbook/OpenWorkbookButton";
import { FileNotesButton } from "@/components/notes/FileNotesButton";
import { loanTypeFullLabel } from "@/lib/search";
import { useApplication } from "@/lib/store";

function fileRoute(pathname: string) {
  const application = pathname.match(/^\/applications\/([^/]+)/);
  if (application) return application[1];
  const senior = pathname.match(/^\/senior-queue\/([^/]+)/);
  if (senior) return senior[1];
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fileId = fileRoute(pathname);

  return (
    <div
      className="flex h-full min-h-full flex-col bg-white text-charcoal"
    >
      <div className="sticky top-0 z-20">
        <TopNav />
        {fileId ? (
          <>
            <header className="bg-white">
              <FileHeader id={fileId} />
            </header>
            <FileTabs
              basePath={
                pathname.startsWith("/senior-queue")
                  ? `/senior-queue/${fileId}`
                  : `/applications/${fileId}`
              }
            />
          </>
        ) : null}
      </div>
      {fileId ? (
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        <main className="flex min-h-0 w-full flex-1 flex-col">{children}</main>
      )}
    </div>
  );
}

function FileHeader({ id }: { id: string }) {
  const { application } = useApplication(id);

  if (!application) {
    return (
      <div className="px-xl py-md">
        <span className="text-sm text-gray-medium">Loading file…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[12px] border-b border-gray-lightest bg-white py-sm">
      <div className="flex items-center justify-between gap-md px-sm pt-[12px]">
        <div className="flex min-w-0 items-center gap-[12px]">
          <Link href="/queue" aria-label="Back to queue" className="inline-flex size-6 items-center justify-center text-primary hover:text-primary-hover">
            <BackIcon />
          </Link>
          <span className="text-2xl font-semibold text-black">{application.id}</span>
          <span className="inline-flex h-9 items-center rounded-[2px] bg-gray-lightest px-[12px] text-xs font-semibold text-charcoal">
            {loanTypeFullLabel(application)}
          </span>
        </div>
        <div className="flex items-center gap-md">
          <OpenWorkbookButton id={id} />
          <FileNotesButton id={id} />
        </div>
      </div>
      <div className="flex flex-wrap gap-xl px-md text-sm">
        <p className="flex gap-sm px-xs py-[12px]">
          <span className="text-gray-dark">Borrower:</span>
          <span className="font-semibold text-black">{application.borrower.fullName}</span>
        </p>
        <p className="flex gap-sm px-xs py-[12px]">
          <span className="text-gray-dark">Co-Signer:</span>
          <span className={application.cosigner ? "font-semibold text-black" : "text-gray-medium"}>
            {application.cosigner?.fullName ?? "N/A"}
          </span>
        </p>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
