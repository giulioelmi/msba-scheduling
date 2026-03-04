// Generated types matching 001_initial.sql
// Re-run `supabase gen types typescript` after schema changes

export type CycleStatus =
  | "setup"
  | "collecting_students"
  | "collecting_candidates"
  | "ready_to_match"
  | "matching"
  | "completed";

export type ParticipantType = "student" | "candidate";

export interface InterviewCycle {
  id: string;
  name: string;
  status: CycleStatus;
  interview_start_date: string | null;   // ISO date string e.g. "2026-04-01"
  interview_end_date: string | null;
  interview_start_time: string;          // "HH:MM"
  interview_end_time: string;
  slot_duration_minutes: number;
  min_interviews_per_student: number;
  max_interviews_per_student: number;
  interviews_per_candidate: number;
  student_form_note: string | null;
  candidate_form_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  cycle_id: string;
  name: string;
  email: string;
  token: string;
  availability_submitted_at: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  cycle_id: string;
  name: string;
  email: string;
  token: string;
  invited_at: string | null;
  availability_submitted_at: string | null;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  cycle_id: string;
  participant_type: ParticipantType;
  participant_id: string;
  slot_start: string;   // ISO timestamptz
  slot_end: string;
  created_at: string;
}

export interface Match {
  id: string;
  cycle_id: string;
  student_id: string;
  candidate_id: string;
  slot_start: string;
  slot_end: string;
  notified_at: string | null;
  created_at: string;
}

// Supabase Database shape for the typed client
export interface Database {
  public: {
    Tables: {
      interview_cycles: {
        Row: InterviewCycle;
        Insert: Partial<InterviewCycle> & { name: string };
        Update: Partial<InterviewCycle>;
      };
      candidates: {
        Row: Candidate;
        Insert: Omit<Candidate, "id" | "token" | "availability_submitted_at" | "created_at">;
        Update: Partial<Candidate>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, "id" | "token" | "invited_at" | "availability_submitted_at" | "created_at">;
        Update: Partial<Student>;
      };
      availability_slots: {
        Row: AvailabilitySlot;
        Insert: Omit<AvailabilitySlot, "id" | "created_at">;
        Update: Partial<AvailabilitySlot>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, "id" | "notified_at" | "created_at">;
        Update: Partial<Match>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
