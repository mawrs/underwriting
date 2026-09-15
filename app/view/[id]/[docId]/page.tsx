import { DocumentViewer } from "@/components/documents/DocumentViewer";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  const { id, docId } = await params;
  return <DocumentViewer id={id} docId={docId} />;
}
