"use client";

import { useRouter } from "next/navigation";
import { QUEUE_VIEWS, type QueueViewId } from "@/lib/queues";
import { useViewLabels } from "@/lib/view-labels";
import { Select } from "@/components/ui/Dropdown";

export function QueueViewSelect({ value }: { value: QueueViewId }) {
  const router = useRouter();
  const { labelFor } = useViewLabels();

  return (
    <Select
      value={value}
      options={QUEUE_VIEWS.map((view) => ({ id: view.id, label: labelFor(view.id) }))}
      onChange={(id) => router.push(`/queue?view=${id}`)}
    />
  );
}
