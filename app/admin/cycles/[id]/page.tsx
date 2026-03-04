import { createServiceRoleClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { STATUS_LABELS, STATUS_COLORS, formatDate, formatSlot } from "@/lib/utils";
import {
  Settings, Users, UserCheck, GitMerge,
  ChevronRight, CheckCircle2, Circle, Clock
} from "lucide-react";

interface Props { params: Promise<{ id: string }> }

export default async function CycleDashboard({ params }: Props) {
  const { id } = await params;
  const db = createServiceRoleClient();

  const [cycleRes, studentsRes, candidatesRes, matchesRes] = await Promise.all([
    db.from("interview_cycles").select("*").eq("id", id).single(),
    db.from("students").select("id, availability_submitted_at, invited_at").eq("cycle_id", id),
    db.from("candidates").select("id, availability_submitted_at").eq("cycle_id", id),
    db.from("matches").select("id, notified_at").eq("cycle_id", id),
  ]);

  if (cycleRes.error || !cycleRes.data) notFound();
  const cycle = cycleRes.data;

  const students = studentsRes.data ?? [];
  const candidates = candidatesRes.data ?? [];
  const matches = matchesRes.data ?? [];

  const stats = [
    {
      label: "Candidates",
      value: candidates.length,
      sub: `${candidates.filter((c) => c.availability_submitted_at).length} submitted availability`,
      href: `/admin/cycles/${id}/candidates`,
      color: "bg-purple-50 text-purple-700",
    },
    {
      label: "Student Volunteers",
      value: students.length,
      sub: `${students.filter((s) => s.availability_submitted_at).length} submitted availability`,
      href: `/admin/cycles/${id}/students`,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Matches Made",
      value: matches.length,
      sub: `${matches.filter((m) => m.notified_at).length} notifications sent`,
      href: `/admin/cycles/${id}/matches`,
      color: "bg-green-50 text-green-700",
    },
  ];

  const steps = [
    { label: "Configure settings", href: `/admin/cycles/${id}/settings`, done: !!cycle.interview_start_date },
    { label: "Import candidates", href: `/admin/cycles/${id}/candidates`, done: candidates.length > 0 },
    { label: "Email student volunteers", href: `/admin/cycles/${id}/students`, done: students.some((s) => s.invited_at) },
    { label: "Collect availability", href: `/admin/cycles/${id}/candidates`, done: candidates.some((c) => c.availability_submitted_at) && students.some((s) => s.availability_submitted_at) },
    { label: "Run matching algorithm", href: `/admin/cycles/${id}/matches`, done: matches.length > 0 },
    { label: "Send match notifications", href: `/admin/cycles/${id}/matches`, done: matches.some((m) => m.notified_at) },
  ];

  const navItems = [
    { label: "Settings", href: `/admin/cycles/${id}/settings`, icon: Settings },
    { label: "Candidates", href: `/admin/cycles/${id}/candidates`, icon: UserCheck },
    { label: "Students", href: `/admin/cycles/${id}/students`, icon: Users },
    { label: "Matches", href: `/admin/cycles/${id}/matches`, icon: GitMerge },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
        <Link href="/admin" className="hover:text-[#2774AE] transition">Cycles</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">{cycle.name}</span>
      </nav>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{cycle.name}</h1>
          {cycle.interview_start_date && (
            <p className="text-gray-500 text-sm mt-1">
              {formatDate(cycle.interview_start_date)} – {formatDate(cycle.interview_end_date!)}
              {" · "}{cycle.interview_start_time} – {cycle.interview_end_time}
              {" · "}{cycle.slot_duration_minutes}‑min slots
            </p>
          )}
        </div>
        <span className={`badge ${STATUS_COLORS[cycle.status]} text-sm px-3 py-1`}>
          {STATUS_LABELS[cycle.status]}
        </span>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="card flex items-center gap-3 hover:border-[#2774AE] hover:shadow-md transition-all group p-4"
          >
            <div className="h-9 w-9 rounded-lg bg-[#EBF3FB] flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-[#2774AE]" />
            </div>
            <span className="font-medium text-gray-900 group-hover:text-[#2774AE] transition text-sm">
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="card hover:border-[#2774AE] transition group p-5">
              <p className="text-3xl font-bold text-gray-900 group-hover:text-[#2774AE] transition">
                {s.value}
              </p>
              <p className="text-sm font-medium text-gray-700 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </Link>
          ))}
        </div>

        {/* Progress checklist */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Process Checklist</h2>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-center gap-3">
                {step.done ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                )}
                <Link
                  href={step.href}
                  className={`text-sm hover:underline ${step.done ? "text-gray-400 line-through" : "text-gray-700"}`}
                >
                  {step.label}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
