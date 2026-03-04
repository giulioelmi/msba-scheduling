import { createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import SettingsForm from "./SettingsForm";

interface Props { params: Promise<{ id: string }> }

export default async function SettingsPage({ params }: Props) {
  const { id } = await params;
  const db = createServiceRoleClient();

  const { data: cycle, error } = await db
    .from("interview_cycles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !cycle) notFound();

  return <SettingsForm cycle={cycle} />;
}
