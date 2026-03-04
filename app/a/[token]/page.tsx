import { createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AvailabilityPicker from "@/components/AvailabilityPicker";

interface Props { params: Promise<{ token: string }> }

export default async function CandidateAvailabilityPage({ params }: Props) {
  const { token } = await params;
  const db = createServiceRoleClient();

  const { data: candidate, error } = await db
    .from("candidates")
    .select("*, interview_cycles(*)")
    .eq("token", token)
    .single();

  if (error || !candidate) notFound();

  const cycle = candidate.interview_cycles as any;

  const { data: existingSlots } = await db
    .from("availability_slots")
    .select("slot_start")
    .eq("participant_type", "candidate")
    .eq("participant_id", candidate.id);

  const existingStarts = (existingSlots ?? []).map((s) => s.slot_start);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#003B5C] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[#FFD100] flex items-center justify-center shrink-0">
            <span className="text-[#003B5C] font-black text-xs">UCLA</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">UCLA Anderson MSBA</h1>
            <p className="text-blue-200 text-sm">{cycle?.name} — Interview Scheduling</p>
          </div>
        </div>
        <div className="h-1 bg-[#FFD100]" />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Hi, {candidate.name}!
          </h2>
          <p className="text-gray-500 text-sm">
            Congratulations on advancing to the second round! Please select all times
            you&apos;re available for your interview. We&apos;ll match you with a current MSBA student.
          </p>
          {cycle?.candidate_form_note && (
            <div className="mt-3 rounded-lg bg-[#EBF3FB] border border-[#2774AE]/20 px-4 py-3 text-sm text-[#003B5C]">
              {cycle.candidate_form_note}
            </div>
          )}
        </div>

        <div className="card">
          <AvailabilityPicker
            cycle={cycle}
            participantType="candidate"
            participantId={candidate.id}
            existingSlots={existingStarts}
          />
        </div>
      </main>
    </div>
  );
}
