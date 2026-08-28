import { QueueTable } from "@/components/queue/QueueTable";
import { queueView } from "@/lib/queues";

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const selected = queueView(view);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-md">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{selected.label}</h1>
        <p className="text-sm text-gray-medium">{selected.lede}</p>
      </div>
      <QueueTable
        viewId={selected.id}
        statuses={[...selected.statuses]}
        hrefFor={selected.hrefFor}
        empty={selected.empty}
      />
    </div>
  );
}
