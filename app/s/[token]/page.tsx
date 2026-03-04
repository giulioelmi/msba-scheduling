import { createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AvailabilityPicker from "@/components/AvailabilityPicker";

interface Props { params: Promise<{ token: string }> }

export default async function StudentAvailabilityPage({ params }: Props) {
  const { token } = await params;
  const db = createServiceRoleClient();

  const { data: student, error: studentErr } = await db
    .from("students")
    .select("*, interview_cycles(*)")
    .eq("token", token)
    .single();

  if (studentErr || !student) notFound();

  const cycle = student.interview_cycles as any;

  // Load existing slots
  const { data: existingSlots } = await db
    .from("availability_slots")
    .select("slot_start")
    .eq("participant_type", "student")
    .eq("participant_id", student.id);

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
            <h1 className="font-bold text-lg leading-tight">MSBA Interview Scheduler</h1>
            <p className="text-blue-200 text-sm">{cycle?.name}</p>
          </div>
        </div>
        <div className="h-1 bg-[#FFD100]" />
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Hi, {student.name}!
          </h2>
          <p className="text-gray-500 text-sm">
            Thank you for volunteering to interview MSBA candidates. Please select all times
            you&apos;re available below. Click a slot to toggle it — green means selected.
          </p>
          {cycle?.student_form_note && (
            <div className="mt-3 rounded-lg bg-[#EBF3FB] border border-[#2774AE]/20 px-4 py-3 text-sm text-[#003B5C]">
              {cycle.student_form_note}
            </div>
          )}
        </div>

        <div className="card">
          <AvailabilityPicker
            cycle={cycle}
            participantType="student"
            participantId={student.id}
            existingSlots={existingStarts}
          />
        </div>
      </main>
    </div>
  );
}
