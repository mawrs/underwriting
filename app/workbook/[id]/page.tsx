import { MasterWorkbook } from "@/components/workbook/MasterWorkbook";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MasterWorkbook id={id} />;
}
