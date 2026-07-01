-- ═══════════════════════════════════════════════════════════
-- MOCK INTERVIEW SESSIONS
-- Stores questions, answers, and evaluation feedback.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.mock_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  job_id          uuid references jobs(id) on delete cascade,
  questions       jsonb not null, -- Array of questions: [{id, text, category}]
  answers         jsonb default '[]'::jsonb, -- Array of answers/feedback: [{questionId, answer, score, feedback}]
  completed       boolean default false,
  created_at      timestamptz default now()
);

ALTER TABLE public.mock_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own mock sessions" ON public.mock_sessions 
  FOR ALL USING (auth.uid() = user_id);
