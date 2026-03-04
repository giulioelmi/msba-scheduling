"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { runMatching } from "@/lib/matching";
import { sendMatchNotification } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function generateMatches(cycleId: string) {
  const db = createServiceRoleClient();

  const [cycleRes, studentsRes, candidatesRes, slotsRes] = await Promise.all([
    db.from("interview_cycles").select("*").eq("id", cycleId).single(),
    db.from("students").select("*").eq("cycle_id", cycleId),
    db.from("candidates").select("*").eq("cycle_id", cycleId),
    db.from("availability_slots").select("*").eq("cycle_id", cycleId),
  ]);

  if (cycleRes.error || !cycleRes.data) return { error: "Cycle not found." };
  if (studentsRes.error || candidatesRes.error || slotsRes.error) {
    return { error: "Failed to load data." };
  }

  const result = runMatching({
    cycle: cycleRes.data,
    students: studentsRes.data ?? [],
    candidates: candidatesRes.data ?? [],
    slots: slotsRes.data ?? [],
  });

  // Delete any existing matches and replace
  await db.from("matches").delete().eq("cycle_id", cycleId);

  if (result.matches.length > 0) {
    const { error: insertErr } = await db.from("matches").insert(result.matches);
    if (insertErr) return { error: insertErr.message };
  }

  // Update cycle status
  await db
    .from("interview_cycles")
    .update({ status: "matching" })
    .eq("id", cycleId);

  revalidatePath(`/admin/cycles/${cycleId}/matches`);
  return {
    success: true,
    matched: result.matches.length,
    unmatched_candidates: result.unmatched_candidates.length,
    unmatched_students: result.unmatched_students.length,
  };
}

export async function sendAllMatchNotifications(cycleId: string) {
  const db = createServiceRoleClient();

  const { data: matches, error } = await db
    .from("matches")
    .select(`
      *,
      students (name, email),
      candidates (name, email),
      interview_cycles (name)
    `)
    .eq("cycle_id", cycleId)
    .is("notified_at", null);

  if (error || !matches) return { error: "Could not load matches." };

  let sent = 0;
  let failed = 0;

  for (const m of matches) {
    const student = m.students as { name: string; email: string } | null;
    const candidate = m.candidates as { name: string; email: string } | null;
    const cycle = m.interview_cycles as { name: string } | null;

    if (!student || !candidate || !cycle) continue;

    try {
      await sendMatchNotification({
        studentEmail: student.email,
        studentName: student.name,
        candidateEmail: candidate.email,
        candidateName: candidate.name,
        cycleName: cycle.name,
        slotStart: m.slot_start,
        slotEnd: m.slot_end,
      });

      await db
        .from("matches")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", m.id);

      sent++;
    } catch {
      failed++;
    }
  }

  await db
    .from("interview_cycles")
    .update({ status: "completed" })
    .eq("id", cycleId);

  revalidatePath(`/admin/cycles/${cycleId}`);
  return { success: true, sent, failed };
}

export async function deleteMatch(matchId: string, cycleId: string) {
  const db = createServiceRoleClient();
  const { error } = await db.from("matches").delete().eq("id", matchId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/cycles/${cycleId}/matches`);
  return { success: true };
}
