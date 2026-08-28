"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { stepDone, WORKFLOW_STEPS, workflowSlugFromPath } from "@/lib/workflow";
import type { Application } from "@/lib/types";
import { useFileWorkspace } from "@/components/application/file-context";

export function WorkflowNav({ application }: { application: Application }) {
  const pathname = usePathname();
  const { basePath, mode } = useFileWorkspace();
  const current = workflowSlugFromPath(pathname);

  return (
    <nav className="min-h-0 overflow-y-auto border-b border-gray-light bg-white py-sm xl:border-r xl:border-b-0" aria-label="Workflow steps">
      <h2 className="px-md pb-sm text-[11px] font-semibold tracking-[0.08em] text-gray-medium uppercase">
        Workflow
      </h2>
      <div className="flex gap-xs overflow-x-auto px-sm xl:block xl:overflow-visible xl:px-0">
        {WORKFLOW_STEPS.map((step, index) => {
          const done = stepDone(application, step.slug);
          const active = step.slug === current;
          return (
            <Link
              key={step.slug}
              href={`${basePath}/${step.slug}`}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-48 items-start gap-sm border-l-[3px] px-md py-sm xl:min-w-0 ${
                active
                  ? "border-primary bg-primary-bg"
                  : "border-transparent hover:bg-gray-extra-light"
              }`}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full text-[11px] ${
                  done
                    ? "bg-success text-white"
                    : "border border-gray-light bg-white text-gray-medium"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              <span>
                <span className="block text-sm text-charcoal">{step.label}</span>
                <span className="block text-[11.5px] text-gray-medium">{step.hint}</span>
              </span>
            </Link>
          );
        })}
      </div>
      <p className="mt-md hidden border-t border-dashed border-gray-light px-md pt-md text-xs leading-md text-gray-medium xl:block">
        {mode === "senior"
          ? "Second-level review. Every field arrives pre-filled from the first underwriter. Anything you change is logged."
          : "On submit this file leaves your queue and lands with a senior underwriter, pre-filled with what you entered."}
      </p>
    </nav>
  );
}
