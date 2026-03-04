"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CycleStatus } from "@/lib/supabase/types";

export async function createCycle(formData: FormData) {
  const db = createServiceRoleClient();

  const { data, error } = await db
    .from("interview_cycles")
    .insert({ name: formData.get("name") as string })
    .select()
    .single();

  if (error) return { error: error.message };

  redirect(`/admin/cycles/${data.id}/settings`);
}

export async function updateCycleSettings(cycleId: string, formData: FormData) {
  const db = createServiceRoleClient();

  const updates = {
    name: formData.get("name") as string,
    interview_start_date: formData.get("interview_start_date") as string || null,
    interview_end_date: formData.get("interview_end_date") as string || null,
    interview_start_time: formData.get("interview_start_time") as string,
    interview_end_time: formData.get("interview_end_time") as string,
    slot_duration_minutes: Number(formData.get("slot_duration_minutes")),
    min_interviews_per_student: Number(formData.get("min_interviews_per_student")),
    max_interviews_per_student: Number(formData.get("max_interviews_per_student")),
    interviews_per_candidate: Number(formData.get("interviews_per_candidate")),
    student_form_note: formData.get("student_form_note") as string || null,
    candidate_form_note: formData.get("candidate_form_note") as string || null,
  };

  const { error } = await db
    .from("interview_cycles")
    .update(updates)
    .eq("id", cycleId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/cycles/${cycleId}`);
  return { success: true };
}

export async function updateCycleStatus(cycleId: string, status: CycleStatus) {
  const db = createServiceRoleClient();

  const { error } = await db
    .from("interview_cycles")
    .update({ status })
    .eq("id", cycleId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/cycles/${cycleId}`);
  return { success: true };
}

export async function deleteCycle(cycleId: string) {
  const db = createServiceRoleClient();

  const { error } = await db
    .from("interview_cycles")
    .delete()
    .eq("id", cycleId);

  if (error) return { error: error.message };

  redirect("/admin");
}
