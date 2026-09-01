import { redirect } from "next/navigation";

export default async function ApplicationIndex({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/applications/${id}/review`);
}
