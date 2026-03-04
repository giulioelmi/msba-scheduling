import { createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { generateMatches, sendAllMatchNotifications, deleteMatch, clearAllMatches } from "@/app/actions/matching";
import { ChevronRight, Zap, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatSlot } from "@/lib/utils";
import RunMatchingButton from "@/components/RunMatchingButton";
import SendNotificationsButton from "@/components/SendNotificationsButton";
import DeleteButton from "@/components/DeleteButton";
import ClearMatchesButton from "@/components/ClearMatchesButton";

interface Props { params: Promise<{ id: string }> }

export default async function MatchesPage({ params }: Props) {
  const { id } = await params;
  const db = createServiceRoleClient();

  const [cycleRes, matchesRes, candidatesRes] = await Promise.all([
    db.from("interview_cycles").select("id, name, status").eq("id", id).single(),
    db.from("matches")
      .select(`*, students(name, email), candidates(name, email)`)
      .eq("cycle_id", id)
      .order("slot_start"),
    db.from("candidates").select("id, name").eq("cycle_id", id),
  ]);

  if (cycleRes.error || !cycleRes.data) notFound();
  const cycle = cycleRes.data;
  const matches = matchesRes.data ?? [];
  const candidates = candidatesRes.data ?? [];

  const unmatchedCandidates = candidates.filter(
    (c) => !matches.some((m) => m.candidate_id === c.id)
  );

  const notified = matches.filter((m) => m.notified_at).length;

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
        <Link href="/admin" className="hover:text-[#2774AE] transition">Cycles</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/admin/cycles/${id}`} className="hover:text-[#2774AE] transition">{cycle.name}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Matches</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-500 text-sm mt-1">
            {matches.length} matches · {notified} notifications sent · {unmatchedCandidates.length} unmatched
          </p>
        </div>
        <div className="flex gap-3">
          {matches.length > 0 && (
            <ClearMatchesButton
              action={clearAllMatches.bind(null, id)}
              count={matches.length}
            />
          )}
          <RunMatchingButton action={generateMatches.bind(null, id)} />
          {matches.length > 0 && (
            <SendNotificationsButton
              action={sendAllMatchNotifications.bind(null, id)}
              pendingCount={matches.length - notified}
            />
          )}
        </div>
      </div>

      {/* Unmatched warning */}
      {unmatchedCandidates.length > 0 && matches.length > 0 && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 mb-6 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {unmatchedCandidates.length} candidate{unmatchedCandidates.length > 1 ? "s" : ""} could not be matched
            </p>
            <p className="text-sm text-yellow-700 mt-0.5">
              {unmatchedCandidates.map((c) => c.name).join(", ")} — no overlapping availability found.
              You may need to manually assign them.
            </p>
          </div>
        </div>
      )}

      {matches.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Candidate</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Notified</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matches.map((m) => {
                const student = m.students as { name: string; email: string } | null;
                const candidate = m.candidates as { name: string; email: string } | null;
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{candidate?.name}</p>
                      <p className="text-gray-400 text-xs">{candidate?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{student?.name}</p>
                      <p className="text-gray-400 text-xs">{student?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{formatSlot(m.slot_start)}</td>
                    <td className="px-4 py-3">
                      {m.notified_at ? (
                        <span className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Sent
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteButton
                        action={deleteMatch.bind(null, m.id, id)}
                        confirm="Remove this match?"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="h-16 w-16 rounded-full bg-[#EBF3FB] flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-[#2774AE]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h2>
          <p className="text-gray-500 text-sm mb-6">
            Once students and candidates have submitted availability, run the matching algorithm.
          </p>
          <RunMatchingButton action={generateMatches.bind(null, id)} />
        </div>
      )}
    </div>
  );
}
