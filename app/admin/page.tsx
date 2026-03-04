import { createServiceRoleClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createCycle } from "@/app/actions/cycles";
import { Plus, ChevronRight } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, formatDate } from "@/lib/utils";

export default async function AdminHome() {
  const db = createServiceRoleClient();
  const { data: cycles } = await db
    .from("interview_cycles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Cycles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage second-round interview rounds</p>
        </div>
        <form action={createCycle}>
          <input type="hidden" name="name" value="New Interview Cycle" />
          <button type="submit" className="btn-primary">
            <Plus className="h-4 w-4" />
            New Cycle
          </button>
        </form>
      </div>

      {!cycles || cycles.length === 0 ? (
        <div className="card text-center py-16">
          <div className="h-16 w-16 rounded-full bg-[#EBF3FB] flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-[#2774AE]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No cycles yet</h2>
          <p className="text-gray-500 text-sm mb-6">Create your first interview cycle to get started.</p>
          <form action={createCycle}>
            <input type="hidden" name="name" value="MSBA 2026 Second Round" />
            <button type="submit" className="btn-primary mx-auto">
              <Plus className="h-4 w-4" />
              Create First Cycle
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          {cycles.map((cycle) => (
            <Link
              key={cycle.id}
              href={`/admin/cycles/${cycle.id}`}
              className="card flex items-center justify-between hover:border-[#2774AE] hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-[#EBF3FB] flex items-center justify-center shrink-0">
                  <span className="text-[#2774AE] font-bold text-sm">
                    {cycle.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 group-hover:text-[#2774AE] transition">
                    {cycle.name}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created {formatDate(cycle.created_at)}
                    {cycle.interview_start_date && (
                      <> · {formatDate(cycle.interview_start_date)} – {formatDate(cycle.interview_end_date!)}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${STATUS_COLORS[cycle.status]}`}>
                  {STATUS_LABELS[cycle.status]}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#2774AE] transition" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
