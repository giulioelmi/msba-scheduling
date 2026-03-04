"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { generateSlots, groupSlotsByDay, cn } from "@/lib/utils";
import { submitAvailability } from "@/app/actions/availability";
import type { InterviewCycle } from "@/lib/supabase/types";

interface Props {
  cycle: InterviewCycle;
  participantType: "student" | "candidate";
  participantId: string;
  existingSlots: string[]; // ISO slot_start strings already submitted
  onSuccess?: () => void;
}

export default function AvailabilityPicker({
  cycle,
  participantType,
  participantId,
  existingSlots,
  onSuccess,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(existingSlots.map((s) => new Date(s).toISOString()))
  );
  const [isPending, setIsPending] = useState(false);
  const [submitted, setSubmitted] = useState(existingSlots.length > 0);
  const [error, setError] = useState<string | null>(null);

  if (!cycle.interview_start_date || !cycle.interview_end_date) {
    return (
      <div className="text-center py-12 text-gray-400">
        Interview dates have not been configured yet. Please check back later.
      </div>
    );
  }

  const allSlots = generateSlots({
    startDate: cycle.interview_start_date,
    endDate: cycle.interview_end_date,
    startTime: cycle.interview_start_time,
    endTime: cycle.interview_end_time,
    durationMinutes: cycle.slot_duration_minutes,
  });

  const grouped = groupSlotsByDay(allSlots);
  const days = [...grouped.keys()].sort();

  function toggleSlot(isoStart: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(isoStart)) next.delete(isoStart);
      else next.add(isoStart);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(allSlots.map((s) => s.start.toISOString())));
  }

  function clearAll() {
    setSelected(new Set());
  }

  async function handleSubmit() {
    setIsPending(true);
    setError(null);
    const result = await submitAvailability({
      participantType,
      participantId,
      cycleId: cycle.id,
      slotStarts: [...selected],
    });
    setIsPending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
      onSuccess?.();
    }
  }

  if (submitted && selected.size > 0) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Availability submitted!</h2>
        <p className="text-gray-500 text-sm mb-1">
          You selected <strong>{selected.size}</strong> time slots.
        </p>
        <p className="text-gray-400 text-sm">You can update your availability by returning to this link.</p>
        <button onClick={() => setSubmitted(false)} className="btn-secondary mt-6 mx-auto">
          Edit my availability
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          <strong>{selected.size}</strong> slot{selected.size !== 1 ? "s" : ""} selected
        </p>
        <div className="flex gap-2">
          <button onClick={selectAll} className="btn-secondary text-xs py-1 px-2">Select All</button>
          <button onClick={clearAll} className="btn-secondary text-xs py-1 px-2">Clear</button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="inline-flex gap-4 min-w-full pb-4">
          {days.map((dayKey) => {
            const daySlots = grouped.get(dayKey)!;
            const dayDate = parseISO(dayKey);
            return (
              <div key={dayKey} className="flex-shrink-0 w-32">
                <div className="text-center mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {format(dayDate, "EEE")}
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {format(dayDate, "MMM d")}
                  </p>
                </div>
                <div className="space-y-1">
                  {daySlots.map((slot) => {
                    const isoStart = slot.start.toISOString();
                    const isSelected = selected.has(isoStart);
                    return (
                      <button
                        key={isoStart}
                        onClick={() => toggleSlot(isoStart)}
                        className={cn(
                          "w-full rounded-lg px-2 py-1.5 text-xs font-medium transition border",
                          isSelected
                            ? "bg-[#2774AE] text-white border-[#2774AE]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#2774AE] hover:text-[#2774AE]"
                        )}
                      >
                        {format(slot.start, "h:mm a")}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isPending || selected.size === 0}
          className="btn-primary"
        >
          {isPending ? "Saving…" : `Submit ${selected.size} slot${selected.size !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
