"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WORKFLOW_STEPS, workflowSlugFromPath } from "@/lib/workflow";

export function FileTabs({ basePath }: { basePath: string }) {
  const pathname = usePathname();
  const current = workflowSlugFromPath(pathname);

  return (
    <nav
      className="flex gap-md overflow-x-auto border-b border-gray-light bg-white px-sm pt-sm"
      aria-label="File sections"
    >
      {WORKFLOW_STEPS.map((step) => {
        const active = step.slug === current;
        return (
          <Link
            key={step.slug}
            href={`${basePath}/${step.slug}`}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "-mb-px shrink-0 border-b-2 border-primary px-xs pb-[17px] pt-sm text-sm whitespace-nowrap text-primary"
                : "-mb-px shrink-0 border-b-2 border-transparent px-xs pb-[17px] pt-sm text-sm whitespace-nowrap text-gray-medium hover:text-primary"
            }
          >
            {step.label}
          </Link>
        );
      })}
    </nav>
  );
}
