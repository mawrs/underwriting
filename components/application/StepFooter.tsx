"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFileWorkspace } from "@/components/application/file-context";
import { stepIndex, WORKFLOW_STEPS, workflowSlugFromPath } from "@/lib/workflow";

export function StepFooter() {
  const pathname = usePathname();
  const { basePath } = useFileWorkspace();
  const current = workflowSlugFromPath(pathname);
  const index = stepIndex(current);
  const prev = index > 0 ? WORKFLOW_STEPS[index - 1] : null;
  const next = index < WORKFLOW_STEPS.length - 1 ? WORKFLOW_STEPS[index + 1] : null;

  return (
    <div className="sticky bottom-0 mt-xl flex justify-between gap-sm border-t border-gray-light bg-white px-md py-sm xl:px-lg">
      {prev ? (
        <Link href={`${basePath}/${prev.slug}`} className="uw-btn-secondary">
          ← {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`${basePath}/${next.slug}`} className="uw-btn-secondary">
          {next.label} →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
