"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileActions } from "@/components/application/FileActions";
import { TopNav } from "@/components/layout/TopNav";
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
      className={
        fileId
          ? "flex min-h-full flex-col bg-white text-charcoal"
          : "flex h-dvh min-h-dvh flex-col bg-white text-charcoal"
      }
    >
      <div className="sticky top-0 z-20">
        <TopNav />
        {fileId ? (
          <header className="border-b border-gray-lightest bg-white">
            <FileHeader id={fileId} />
          </header>
        ) : null}
      </div>
      {fileId ? (
        children
      ) : (
        <main className="flex min-h-0 w-full flex-1 flex-col">{children}</main>
      )}
    </div>
  );
}

function FileHeader({ id }: { id: string }) {
  const pathname = usePathname();
  const { application } = useApplication(id);
  const basePath = pathname.startsWith("/senior-queue")
    ? `/senior-queue/${id}`
    : `/applications/${id}`;

  if (!application) {
    return (
      <div className="px-xl py-lg">
        <span className="text-sm text-gray-medium">Loading file…</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-md px-xl py-lg">
      <div className="flex min-w-0 items-center gap-[12px]">
        <Link href="/queue" aria-label="Back to queue" className="inline-flex size-6 items-center justify-center text-gray-dark hover:text-primary">
          <BackIcon />
        </Link>
        <div className="flex min-w-0 flex-col gap-xs">
          <Link href={`${basePath}/opportunity`} className="text-sm text-gray-dark hover:text-primary">
            Opportunity
          </Link>
          <p className="truncate text-lg font-semibold text-black">
            {application.borrower.fullName} - {application.id}
          </p>
        </div>
      </div>
      <FileActions id={id} />
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
