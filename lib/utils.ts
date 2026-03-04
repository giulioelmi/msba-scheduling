import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, addMinutes, eachDayOfInterval, eachMinuteOfInterval, startOfDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a timestamptz ISO string for display */
export function formatSlot(iso: string): string {
  return format(parseISO(iso), "EEE, MMM d 'at' h:mm a");
}

export function formatSlotTime(iso: string): string {
  return format(parseISO(iso), "h:mm a");
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy");
}

/**
 * Generate all slot start/end pairs for a cycle.
 * Returns arrays of { start: Date, end: Date } for each slot.
 */
export function generateSlots({
  startDate,
  endDate,
  startTime,   // "HH:MM"
  endTime,     // "HH:MM"
  durationMinutes,
}: {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}): Array<{ start: Date; end: Date }> {
  const days = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  });

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const slots: Array<{ start: Date; end: Date }> = [];

  for (const day of days) {
    const dayStart = new Date(day);
    dayStart.setHours(startH, startM, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(endH, endM, 0, 0);

    let cursor = dayStart;
    while (cursor < dayEnd) {
      const next = addMinutes(cursor, durationMinutes);
      if (next <= dayEnd) {
        slots.push({ start: new Date(cursor), end: new Date(next) });
      }
      cursor = next;
    }
  }

  return slots;
}

/** Group slots by day label */
export function groupSlotsByDay(slots: Array<{ start: Date; end: Date }>) {
  const groups = new Map<string, Array<{ start: Date; end: Date }>>();
  for (const slot of slots) {
    const key = format(slot.start, "yyyy-MM-dd");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(slot);
  }
  return groups;
}

/** Parse CSV text → array of { name, email } */
export function parseCandidateCSV(text: string): Array<{ name: string; email: string }> {
  const lines = text.trim().split("\n").filter(Boolean);
  const result: Array<{ name: string; email: string }> = [];

  for (const line of lines) {
    // Support: "Name, Email" or "Name\tEmail" or just "Email" (name defaults to email prefix)
    const parts = line.split(/,|\t/).map((p) => p.trim().replace(/^["']|["']$/g, ""));
    if (parts.length >= 2) {
      const [name, email] = parts;
      if (email.includes("@")) {
        result.push({ name, email: email.toLowerCase() });
      }
    } else if (parts.length === 1 && parts[0].includes("@")) {
      const email = parts[0].toLowerCase();
      result.push({ name: email.split("@")[0], email });
    }
  }

  return result;
}

export const STATUS_LABELS: Record<string, string> = {
  setup: "Setup",
  collecting_students: "Collecting Student Availability",
  collecting_candidates: "Collecting Candidate Availability",
  ready_to_match: "Ready to Match",
  matching: "Matching Complete",
  completed: "Completed",
};

export const STATUS_COLORS: Record<string, string> = {
  setup: "bg-gray-100 text-gray-700",
  collecting_students: "bg-blue-100 text-blue-700",
  collecting_candidates: "bg-purple-100 text-purple-700",
  ready_to_match: "bg-yellow-100 text-yellow-700",
  matching: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
};
