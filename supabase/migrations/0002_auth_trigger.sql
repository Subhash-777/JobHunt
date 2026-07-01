-- ═══════════════════════════════════════════════════════════
-- AUTHENTICATION TRIGGER
-- Automatically creates a profile row when a user signs up.
-- ═══════════════════════════════════════════════════════════

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role_persona)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'fresher' -- default, to be updated by user via profile form
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists to make it idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
