import { redirect } from "next/navigation";

export default function SeniorQueuePage() {
  redirect("/queue?view=final-review");
}
