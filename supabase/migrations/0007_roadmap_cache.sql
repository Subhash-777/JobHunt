-- Migration 0007_roadmap_cache.sql
-- Add roadmap_cache column to fit_scores table for storing AI skill gap roadmaps
ALTER TABLE fit_scores
  ADD COLUMN IF NOT EXISTS roadmap_cache jsonb;

-- Add hidden_gem_score, crowding_score, urgency_score to jobs table if missing
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS hidden_gem_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crowding_score numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS urgency_score numeric DEFAULT 0;
