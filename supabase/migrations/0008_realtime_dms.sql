-- ═══════════════════════════════════════════════════════════
-- MIGRATION 0008: Realtime Direct Messaging for Referrals
-- ═══════════════════════════════════════════════════════════

create table if not exists dm_conversations (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid references referral_requests(id) on delete cascade,
  user_a      uuid references profiles(id) on delete cascade,  -- referral seeker
  user_b      uuid references profiles(id) on delete cascade,  -- referral provider
  created_at  timestamptz default now()
);

create table if not exists dm_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references dm_conversations(id) on delete cascade,
  sender_id       uuid references profiles(id) on delete cascade,
  content         text not null check (char_length(content) <= 500),
  created_at      timestamptz default now()
);

alter table dm_conversations enable row level security;
alter table dm_messages enable row level security;

drop policy if exists "own conversations" on dm_conversations;
create policy "own conversations"
  on dm_conversations for all
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "own messages" on dm_messages;
create policy "own messages"
  on dm_messages for all
  using (
    conversation_id in (
      select id from dm_conversations
      where user_a = auth.uid() or user_b = auth.uid()
    )
  );

-- Enable publication for realtime on dm_messages if not already active
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and tablename = 'dm_messages'
  ) then
    alter publication supabase_realtime add table dm_messages;
  end if;
exception when others then
  -- Ignore if publication does not exist in local env
  null;
end $$;
