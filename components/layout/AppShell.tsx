"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { money, shortDate } from "@/lib/format";
import { useApplication } from "@/lib/store";

function fileRoute(pathname: string) {
  const application = pathname.match(/^\/applications\/([^/]+)/);
  if (application) {
    return { id: application[1], queueHref: "/queue", queueLabel: "Queue" };
  }
  const senior = pathname.match(/^\/senior-queue\/([^/]+)/);
  if (senior) {
    return { id: senior[1], queueHref: "/senior-queue", queueLabel: "Senior queue" };
  }
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const file = fileRoute(pathname);

  return (
    <div
      className={`flex h-full min-h-full flex-col text-charcoal ${
        file ? "bg-gray-extra-light" : "bg-white"
      }`}
    >
      <div className="sticky top-0 z-20">
        <TopNav />
        {file ? (
          <header className="border-b border-gray-light bg-white">
            <FileHeader
              id={file.id}
              queueHref={file.queueHref}
              queueLabel={file.queueLabel}
            />
          </header>
        ) : null}
      </div>
      {file ? (
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      ) : (
        <main className="flex min-h-0 w-full flex-1 flex-col bg-white px-2xl py-xl">{children}</main>
      )}
    </div>
  );
}

function FileHeader({
  id,
  queueHref,
  queueLabel,
}: {
  id: string;
  queueHref: string;
  queueLabel: string;
}) {
  const { application } = useApplication(id);

  return (
    <div className="flex flex-wrap items-center justify-between gap-md px-2xl py-sm">
      <div className="flex min-w-0 flex-wrap items-baseline gap-sm">
        <Link href={queueHref} className="text-sm text-gray-medium hover:text-primary">
          ← {queueLabel}
        </Link>
        {application ? (
          <>
            <strong className="text-base text-navy">{application.borrower.fullName}</strong>
            <span className="font-mono text-sm text-gray-medium">{application.id}</span>
            <span className="text-sm text-gray-medium">
              {application.recordType} · {money(application.amount)}
            </span>
            <StatusBadge value={application.status} />
          </>
        ) : (
          <span className="text-sm text-gray-medium">Loading file…</span>
        )}
      </div>
      {application?.lastSavedAt ? (
        <span className="text-xs text-gray-medium">
          Draft saved {shortDate(application.lastSavedAt)}
        </span>
      ) : (
        <span className="text-xs text-gray-medium">Draft saved locally</span>
      )}
    </div>
  );
}
