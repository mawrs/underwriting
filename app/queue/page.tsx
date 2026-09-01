import { QueueTable } from "@/components/queue/QueueTable";
import { QueueTitle } from "@/components/queue/QueueTitle";
import { queueView } from "@/lib/queues";

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const selected = queueView(view);

  return (
    <QueueTable
      title={<QueueTitle viewId={selected.id} />}
      viewId={selected.id}
      statuses={[...selected.statuses]}
      hrefFor={selected.hrefFor}
      empty={selected.empty}
    />
  );
}
