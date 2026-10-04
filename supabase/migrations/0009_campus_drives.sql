-- ═══════════════════════════════════════════════════════════
-- MIGRATION 0009: Off-Campus Drive Aggregator Schema
-- ═══════════════════════════════════════════════════════════

create table if not exists campus_drives (
  id              uuid primary key default gen_random_uuid(),
  company         text not null,
  company_logo    text,
  role_title      text not null,
  drive_type      text not null default 'off_campus',   -- 'off_campus' | 'pool_campus' | 'mass_recruitment'
  eligible_batches int[],
  eligible_degrees text[],
  cgpa_cutoff     numeric,
  registration_url text not null,
  deadline        timestamptz,
  drive_date      timestamptz,
  location        text,
  stipend_ctc_text text,
  bond_flag       boolean default false,
  submitted_by    uuid references profiles(id),
  approved        boolean default true,  -- default true for seed / user submissions
  auto_approve_at timestamptz default now() + interval '24 hours',
  flags           int default 0,
  created_at      timestamptz default now()
);

alter table campus_drives enable row level security;

drop policy if exists "drives public read" on campus_drives;
create policy "drives public read" on campus_drives for select using (approved = true);

drop policy if exists "own drives" on campus_drives;
create policy "own drives" on campus_drives for insert with check (auth.uid() = submitted_by);
