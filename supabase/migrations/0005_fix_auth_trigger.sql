-- ═══════════════════════════════════════════════════════════
-- FIX AUTHENTICATION TRIGGER (Option A Fix)
-- Corrects the schema columns (uses email/user_type instead of role_persona).
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, user_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'student'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
