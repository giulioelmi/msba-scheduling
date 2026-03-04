-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- Interview Cycles
-- One row per annual/semi-annual interview round
-- ─────────────────────────────────────────────
create table interview_cycles (
  id                            uuid primary key default gen_random_uuid(),
  name                          text not null,       -- e.g. "MSBA 2026 Second Round"
  status                        text not null default 'setup'
    check (status in ('setup', 'collecting_students', 'collecting_candidates', 'ready_to_match', 'matching', 'completed')),

  -- Interview window
  interview_start_date          date,
  interview_end_date            date,
  interview_start_time          time default '09:00',
  interview_end_time            time default '17:00',
  slot_duration_minutes         int  default 30,

  -- Constraints per student
  min_interviews_per_student    int  default 1,
  max_interviews_per_student    int  default 3,

  -- Constraints per candidate
  interviews_per_candidate      int  default 1,

  -- Optional notes shown on availability forms
  student_form_note             text,
  candidate_form_note           text,

  created_at                    timestamptz default now(),
  updated_at                    timestamptz default now()
);

-- ─────────────────────────────────────────────
-- Candidates (applicants being interviewed)
-- ─────────────────────────────────────────────
create table candidates (
  id                        uuid primary key default gen_random_uuid(),
  cycle_id                  uuid not null references interview_cycles(id) on delete cascade,
  name                      text not null,
  email                     text not null,
  -- Unique token embedded in the availability link (no login required)
  token                     text unique not null default encode(gen_random_bytes(24), 'hex'),
  availability_submitted_at timestamptz,
  created_at                timestamptz default now(),
  unique (cycle_id, email)
);

-- ─────────────────────────────────────────────
-- Students (current students who volunteer)
-- ─────────────────────────────────────────────
create table students (
  id                        uuid primary key default gen_random_uuid(),
  cycle_id                  uuid not null references interview_cycles(id) on delete cascade,
  name                      text not null,
  email                     text not null,
  -- Unique token embedded in the availability link (no login required)
  token                     text unique not null default encode(gen_random_bytes(24), 'hex'),
  invited_at                timestamptz,
  availability_submitted_at timestamptz,
  created_at                timestamptz default now(),
  unique (cycle_id, email)
);

-- ─────────────────────────────────────────────
-- Availability Slots
-- 30-min blocks selected by students or candidates
-- ─────────────────────────────────────────────
create table availability_slots (
  id               uuid primary key default gen_random_uuid(),
  cycle_id         uuid not null references interview_cycles(id) on delete cascade,
  participant_type text not null check (participant_type in ('student', 'candidate')),
  participant_id   uuid not null,
  slot_start       timestamptz not null,
  slot_end         timestamptz not null,
  created_at       timestamptz default now(),
  -- Prevent duplicates
  unique (participant_type, participant_id, slot_start)
);

-- ─────────────────────────────────────────────
-- Matches
-- Each candidate gets exactly `interviews_per_candidate` matches
-- ─────────────────────────────────────────────
create table matches (
  id           uuid primary key default gen_random_uuid(),
  cycle_id     uuid not null references interview_cycles(id) on delete cascade,
  student_id   uuid not null references students(id) on delete cascade,
  candidate_id uuid not null references candidates(id) on delete cascade,
  slot_start   timestamptz not null,
  slot_end     timestamptz not null,
  notified_at  timestamptz,
  created_at   timestamptz default now(),
  -- One match per candidate (extend to unique(cycle_id, candidate_id, ordinal) if interviews_per_candidate > 1)
  unique (cycle_id, student_id, slot_start),
  unique (cycle_id, candidate_id, slot_start)
);

-- ─────────────────────────────────────────────
-- Auto-update updated_at on interview_cycles
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_cycles_updated_at
  before update on interview_cycles
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- Row Level Security
-- Admins use the service role key (bypasses RLS).
-- Public token-based access is scoped per token.
-- ─────────────────────────────────────────────
alter table interview_cycles    enable row level security;
alter table candidates          enable row level security;
alter table students            enable row level security;
alter table availability_slots  enable row level security;
alter table matches             enable row level security;

-- Service role can do everything (used by server actions)
-- The anon key is only used for token-based form submissions

-- Allow reading a candidate's own record by token (used on availability form)
create policy "candidates: read own by token"
  on candidates for select
  using (token = current_setting('request.jwt.claims', true)::json->>'token');

-- Allow reading a student's own record by token
create policy "students: read own by token"
  on students for select
  using (token = current_setting('request.jwt.claims', true)::json->>'token');

-- Token-holders can insert their own availability
create policy "availability: insert by token participant"
  on availability_slots for insert
  with check (
    (participant_type = 'candidate' and exists (
      select 1 from candidates where id = participant_id
        and token = current_setting('request.jwt.claims', true)::json->>'token'
    ))
    or
    (participant_type = 'student' and exists (
      select 1 from students where id = participant_id
        and token = current_setting('request.jwt.claims', true)::json->>'token'
    ))
  );

-- Token-holders can delete (replace) their own availability
create policy "availability: delete by token participant"
  on availability_slots for delete
  using (
    (participant_type = 'candidate' and exists (
      select 1 from candidates where id = participant_id
        and token = current_setting('request.jwt.claims', true)::json->>'token'
    ))
    or
    (participant_type = 'student' and exists (
      select 1 from students where id = participant_id
        and token = current_setting('request.jwt.claims', true)::json->>'token'
    ))
  );
