/**
 * Matching Algorithm
 *
 * Greedy bipartite matching on overlapping availability slots.
 *
 * Strategy:
 * 1. Build a map: candidateId → Set<slotKey> and studentId → Set<slotKey>
 * 2. For each candidate (sorted by fewest overlapping options first — hardest to match first),
 *    find all students who share at least one slot and haven't exceeded their max interviews.
 * 3. Pick the student with the fewest total assignments (load balancing).
 * 4. Record the match at the earliest shared slot.
 *
 * This is O(C * S) which is fine for MSBA scale (hundreds of participants).
 */

import type { AvailabilitySlot, InterviewCycle, Match, Student, Candidate } from "./supabase/types";

export interface MatchInput {
  cycle: InterviewCycle;
  students: Student[];
  candidates: Candidate[];
  slots: AvailabilitySlot[];
}

export interface MatchResult {
  matches: Omit<Match, "id" | "notified_at" | "created_at">[];
  unmatched_candidates: string[];  // candidate ids with no match found
  unmatched_students: string[];    // student ids who got fewer than min_interviews
}

export function runMatching(input: MatchInput): MatchResult {
  const { cycle, students, candidates, slots } = input;
  const { max_interviews_per_student, min_interviews_per_student, interviews_per_candidate } = cycle;

  // Index slots by participant
  const studentSlots = new Map<string, Set<string>>();
  const candidateSlots = new Map<string, Set<string>>();
  const slotStartByKey = new Map<string, string>();  // key → ISO start
  const slotEndByKey = new Map<string, string>();

  for (const slot of slots) {
    const key = slot.slot_start;
    slotStartByKey.set(key, slot.slot_start);
    slotEndByKey.set(key, slot.slot_end);

    if (slot.participant_type === "student") {
      if (!studentSlots.has(slot.participant_id)) studentSlots.set(slot.participant_id, new Set());
      studentSlots.get(slot.participant_id)!.add(key);
    } else {
      if (!candidateSlots.has(slot.participant_id)) candidateSlots.set(slot.participant_id, new Set());
      candidateSlots.get(slot.participant_id)!.add(key);
    }
  }

  // Track assignments
  const studentAssignments = new Map<string, number>();  // studentId → count
  const studentUsedSlots = new Map<string, Set<string>>(); // studentId → used slot keys
  const candidateMatchCount = new Map<string, number>();

  for (const s of students) {
    studentAssignments.set(s.id, 0);
    studentUsedSlots.set(s.id, new Set());
  }

  // For each candidate, find overlapping students
  // Sort candidates by number of overlapping options (fewest first) for better matching
  const candidateOptions = candidates.map((c) => {
    const cSlots = candidateSlots.get(c.id) ?? new Set<string>();
    let optionCount = 0;
    for (const s of students) {
      const sSlots = studentSlots.get(s.id) ?? new Set<string>();
      const overlap = [...cSlots].filter((k) => sSlots.has(k));
      if (overlap.length > 0) optionCount++;
    }
    return { candidate: c, optionCount };
  });

  candidateOptions.sort((a, b) => a.optionCount - b.optionCount);

  const matches: Omit<Match, "id" | "notified_at" | "created_at">[] = [];
  const unmatchedCandidates: string[] = [];

  for (const { candidate } of candidateOptions) {
    const cSlots = candidateSlots.get(candidate.id) ?? new Set<string>();
    const needed = interviews_per_candidate - (candidateMatchCount.get(candidate.id) ?? 0);

    let assigned = 0;

    // Find eligible students sorted by current load (fewest assignments first)
    const eligibleStudents = students
      .filter((s) => (studentAssignments.get(s.id) ?? 0) < max_interviews_per_student)
      .map((s) => {
        const sSlots = studentSlots.get(s.id) ?? new Set<string>();
        const usedSlots = studentUsedSlots.get(s.id)!;
        const overlap = [...cSlots]
          .filter((k) => sSlots.has(k) && !usedSlots.has(k))
          .sort(); // pick earliest slot
        return { student: s, overlap };
      })
      .filter((e) => e.overlap.length > 0)
      .sort((a, b) => (studentAssignments.get(a.student.id) ?? 0) - (studentAssignments.get(b.student.id) ?? 0));

    for (const { student, overlap } of eligibleStudents) {
      if (assigned >= needed) break;

      const slotKey = overlap[0];
      matches.push({
        cycle_id: cycle.id,
        student_id: student.id,
        candidate_id: candidate.id,
        slot_start: slotStartByKey.get(slotKey)!,
        slot_end: slotEndByKey.get(slotKey)!,
      });

      studentAssignments.set(student.id, (studentAssignments.get(student.id) ?? 0) + 1);
      studentUsedSlots.get(student.id)!.add(slotKey);
      candidateMatchCount.set(candidate.id, (candidateMatchCount.get(candidate.id) ?? 0) + 1);
      assigned++;
    }

    if (assigned < needed) {
      unmatchedCandidates.push(candidate.id);
    }
  }

  const unmatchedStudents = students
    .filter((s) => (studentAssignments.get(s.id) ?? 0) < min_interviews_per_student)
    .map((s) => s.id);

  return { matches, unmatched_candidates: unmatchedCandidates, unmatched_students: unmatchedStudents };
}
