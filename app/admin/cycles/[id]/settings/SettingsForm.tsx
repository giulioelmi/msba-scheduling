"use client";

import { useState, useTransition } from "react";
import { updateCycleSettings, deleteCycle } from "@/app/actions/cycles";
import Link from "next/link";
import { ChevronRight, Save, Trash2 } from "lucide-react";
import type { InterviewCycle } from "@/lib/supabase/types";

export default function SettingsForm({ cycle }: { cycle: InterviewCycle }) {
  const { id } = cycle;
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateCycleSettings(id, formData);
      if (result?.error) setError(result.error);
      else setSuccess(true);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCycle(id);
    });
  }

  return (
    <div className="max-w-2xl">
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
        <Link href="/admin" className="hover:text-[#2774AE] transition">Cycles</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/admin/cycles/${id}`} className="hover:text-[#2774AE] transition">{cycle.name}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Settings</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cycle Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">General</h2>
          <div>
            <label className="label">Cycle Name</label>
            <input name="name" className="input" defaultValue={cycle.name} required />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Interview Window</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input name="interview_start_date" type="date" className="input"
                defaultValue={cycle.interview_start_date ?? ""} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input name="interview_end_date" type="date" className="input"
                defaultValue={cycle.interview_end_date ?? ""} />
            </div>
            <div>
              <label className="label">Daily Start Time</label>
              <input name="interview_start_time" type="time" className="input"
                defaultValue={cycle.interview_start_time} />
            </div>
            <div>
              <label className="label">Daily End Time</label>
              <input name="interview_end_time" type="time" className="input"
                defaultValue={cycle.interview_end_time} />
            </div>
          </div>
          <div>
            <label className="label">Slot Duration (minutes)</label>
            <select name="slot_duration_minutes" className="input" defaultValue={cycle.slot_duration_minutes}>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Interview Constraints</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Min interviews / student</label>
              <input name="min_interviews_per_student" type="number" min={0} max={20} className="input"
                defaultValue={cycle.min_interviews_per_student} />
            </div>
            <div>
              <label className="label">Max interviews / student</label>
              <input name="max_interviews_per_student" type="number" min={1} max={20} className="input"
                defaultValue={cycle.max_interviews_per_student} />
            </div>
            <div>
              <label className="label">Interviews / candidate</label>
              <input name="interviews_per_candidate" type="number" min={1} max={5} className="input"
                defaultValue={cycle.interviews_per_candidate} />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Form Instructions</h2>
          <p className="text-sm text-gray-500">
            Optional notes displayed at the top of each availability form.
          </p>
          <div>
            <label className="label">Student form note</label>
            <textarea name="student_form_note" className="input min-h-[80px]"
              placeholder="e.g. Thank you for volunteering! Please select all times you're available…"
              defaultValue={cycle.student_form_note ?? ""} />
          </div>
          <div>
            <label className="label">Candidate form note</label>
            <textarea name="candidate_form_note" className="input min-h-[80px]"
              placeholder="e.g. Please mark all times you're available for your interview…"
              defaultValue={cycle.candidate_form_note ?? ""} />
          </div>
        </div>

        {success && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">Settings saved!</p>
        )}
        {error && (
          <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center justify-between">
          <button type="submit" disabled={isPending} className="btn-primary">
            <Save className="h-4 w-4" />
            {isPending ? "Saving…" : "Save Settings"}
          </button>
          <button type="button" onClick={() => setShowDelete(true)} className="btn-danger">
            <Trash2 className="h-4 w-4" />
            Delete Cycle
          </button>
        </div>
      </form>

      {showDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="font-bold text-gray-900 mb-2">Delete this cycle?</h2>
            <p className="text-sm text-gray-500 mb-6">
              All candidates, students, availability, and matches will be permanently deleted.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isPending} className="btn-danger flex-1 justify-center">
                {isPending ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
