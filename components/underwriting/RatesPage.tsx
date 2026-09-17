"use client";

import { useFileWorkspace } from "@/components/application/file-context";
import { RateOffers } from "@/components/underwriting/RateOffers";
import { RatesTable } from "@/components/underwriting/RatesTable";
import { useApplication } from "@/lib/store";

export function RatesPage() {
  const { id, readOnly } = useFileWorkspace();
  const { application, updateApplication } = useApplication(id);
  if (!application) return null;

  function select(patch: Parameters<typeof updateApplication>[1]) {
    updateApplication(id, patch);
  }

  return (
    <div className="flex flex-col">
      <section className="bg-white">
        <div className="uw-card-header">
          <h1 className="text-lg text-black">Rates</h1>
          <p className="flex items-center gap-sm text-sm text-gray-dark">
            <span className="size-[14px] rounded-xs bg-yellow" aria-hidden />
            Color = selected
          </p>
        </div>
        <RatesTable application={application} readOnly={readOnly} onSelect={select} />
      </section>
      <RateOffers application={application} readOnly={readOnly} onSelect={select} />
    </div>
  );
}
