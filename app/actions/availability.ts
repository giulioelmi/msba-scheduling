"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";

export async function submitAvailability({
  participantType,
  participantId,
  cycleId,
  slotStarts,  // ISO timestamptz strings
}: {
  participantType: "student" | "candidate";
  participantId: string;
  cycleId: string;
  slotStarts: string[];
}) {
  const db = createServiceRoleClient();

  // Fetch cycle to compute slot ends
  const { data: cycle, error: cycleErr } = await db
    .from("interview_cycles")
    .select("slot_duration_minutes")
    .eq("id", cycleId)
    .single();

  if (cycleErr || !cycle) return { error: "Cycle not found." };

  const durationMs = cycle.slot_duration_minutes * 60 * 1000;

  // Delete existing availability then re-insert (replace strategy)
  await db
    .from("availability_slots")
    .delete()
    .eq("participant_type", participantType)
    .eq("participant_id", participantId);

  if (slotStarts.length > 0) {
    const rows = slotStarts.map((start) => ({
      cycle_id: cycleId,
      participant_type: participantType,
      participant_id: participantId,
      slot_start: start,
      slot_end: new Date(new Date(start).getTime() + durationMs).toISOString(),
    }));

    const { error: insertErr } = await db.from("availability_slots").insert(rows);
    if (insertErr) return { error: insertErr.message };
  }

  // Mark submitted_at
  const now = new Date().toISOString();
  if (participantType === "student") {
    await db.from("students").update({ availability_submitted_at: now }).eq("id", participantId);
  } else {
    await db.from("candidates").update({ availability_submitted_at: now }).eq("id", participantId);
  }

  return { success: true };
}
