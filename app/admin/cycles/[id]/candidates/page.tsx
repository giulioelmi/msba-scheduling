import { createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { importCandidates, emailAllCandidates, deleteCandidate } from "@/app/actions/candidates";
import { ChevronRight, Mail, Upload, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import CsvImportForm from "@/components/CsvImportForm";
import EmailBlastButton from "@/components/EmailBlastButton";
import DeleteButton from "@/components/DeleteButton";

interface Props { params: Promise<{ id: string }> }

export default async function CandidatesPage({ params }: Props) {
  const { id } = await params;
  const db = createServiceRoleClient();

  const [cycleRes, candidatesRes] = await Promise.all([
    db.from("interview_cycles").select("id, name").eq("id", id).single(),
    db.from("candidates").select("*").eq("cycle_id", id).order("name"),
  ]);

  if (cycleRes.error || !cycleRes.data) notFound();
  const cycle = cycleRes.data;
  const candidates = candidatesRes.data ?? [];
  const submitted = candidates.filter((c) => c.availability_submitted_at).length;

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div>
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
        <Link href="/admin" className="hover:text-[#2774AE] transition">Cycles</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/admin/cycles/${id}`} className="hover:text-[#2774AE] transition">{cycle.name}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Candidates</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 text-sm mt-1">
            {candidates.length} total · {submitted} submitted availability
          </p>
        </div>
        <EmailBlastButton
          action={emailAllCandidates.bind(null, id)}
          label="Email All Candidates"
          confirm={`Send availability request emails to all ${candidates.length} candidates?`}
        />
      </div>

      {/* Import */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="h-4 w-4 text-[#2774AE]" />
          <h2 className="font-semibold text-gray-900">Import Candidates</h2>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Paste CSV rows: <code className="bg-gray-100 px-1 rounded text-xs">Name, Email</code> (one per line).
          Duplicate emails are ignored.
        </p>
        <CsvImportForm
          action={importCandidates.bind(null, id)}
          placeholder={"John Smith, john.smith@email.com\nJane Doe, jane.doe@email.com"}
        />
      </div>

      {/* Candidate list */}
      {candidates.length > 0 ? (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Availability</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Form Link</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email}</td>
                  <td className="px-4 py-3">
                    {c.availability_submitted_at ? (
                      <span className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Submitted {formatDate(c.availability_submitted_at)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="h-4 w-4" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`${APP_URL}/a/${c.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2774AE] hover:underline flex items-center gap-1"
                    >
                      Open link <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton
                      action={deleteCandidate.bind(null, c.id, id)}
                      confirm={`Remove ${c.name} from this cycle?`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-400">
          No candidates yet. Import some above.
        </div>
      )}
    </div>
  );
}
