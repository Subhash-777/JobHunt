-- Migration 0006_enhanced_profile.sql
-- Add new profile fields for social links, education, achievements, and synced github projects

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS leetcode_url text,
  ADD COLUMN IF NOT EXISTS school_name_12th text,
  ADD COLUMN IF NOT EXISTS percentage_12th numeric,
  ADD COLUMN IF NOT EXISTS school_name_10th text,
  ADD COLUMN IF NOT EXISTS percentage_10th numeric,
  ADD COLUMN IF NOT EXISTS courses text[],
  ADD COLUMN IF NOT EXISTS honors_awards text[],
  ADD COLUMN IF NOT EXISTS publications text[],
  ADD COLUMN IF NOT EXISTS github_projects jsonb;
