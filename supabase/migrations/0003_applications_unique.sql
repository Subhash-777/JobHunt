-- ═══════════════════════════════════════════════════════════
-- UNIQUE CONSTRAINT ON APPLICATIONS
-- Ensures a user can only have one application record per job.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE public.applications
ADD CONSTRAINT unique_user_job UNIQUE (user_id, job_id);
