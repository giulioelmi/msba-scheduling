"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendCandidateInvite } from "@/lib/email";
import { parseCandidateCSV } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function importCandidates(cycleId: string, formData: FormData) {
  const db = createServiceRoleClient();
  const raw = formData.get("csv") as string;

  const parsed = parseCandidateCSV(raw);
  if (parsed.length === 0) return { error: "No valid rows found. Expected: Name, Email (one per line)." };

  const rows = parsed.map((p) => ({ cycle_id: cycleId, name: p.name, email: p.email }));

  const { error, data } = await db
    .from("candidates")
    .upsert(rows, { onConflict: "cycle_id,email", ignoreDuplicates: true })
    .select();

  if (error) return { error: error.message };

  revalidatePath(`/admin/cycles/${cycleId}/candidates`);
  return { success: true, count: data?.length ?? 0 };
}

export async function deleteCandidate(candidateId: string, cycleId: string) {
  const db = createServiceRoleClient();
  const { error } = await db.from("candidates").delete().eq("id", candidateId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/cycles/${cycleId}/candidates`);
  return { success: true };
}

export async function emailAllCandidates(cycleId: string) {
  const db = createServiceRoleClient();

  const { data: cycle } = await db
    .from("interview_cycles")
    .select("name")
    .eq("id", cycleId)
    .single();

  const { data: candidates, error } = await db
    .from("candidates")
    .select("*")
    .eq("cycle_id", cycleId);

  if (error || !candidates || !cycle) return { error: "Could not load candidates." };

  let sent = 0;
  let failed = 0;
  for (const c of candidates) {
    try {
      await sendCandidateInvite({
        to: c.email,
        candidateName: c.name,
        cycleName: cycle.name,
        token: c.token,
      });
      sent++;
    } catch {
      failed++;
    }
  }

  revalidatePath(`/admin/cycles/${cycleId}/candidates`);
  return { success: true, sent, failed };
}
