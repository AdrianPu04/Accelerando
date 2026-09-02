-- Run in Supabase SQL Editor

create table if not exists reflections (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  piece_id text not null,
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists recommendations (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  from_piece_id text not null,
  to_piece jsonb not null,
  reasoning text not null,
  based_on text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists listening_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  piece_id text not null,
  reflection_id uuid references reflections(id) on delete set null,
  recommendation_id uuid references recommendations(id) on delete set null,
  listened_at timestamptz not null default now()
);

create table if not exists annotations (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  piece_id text not null,
  timestamp_seconds numeric not null,
  label text not null,
  note text not null,
  category text not null,
  primary key (user_id, piece_id, id)
);

create index if not exists listening_sessions_user_listened_at
  on listening_sessions (user_id, listened_at desc);

create index if not exists annotations_user_piece
  on annotations (user_id, piece_id);

alter table reflections enable row level security;
alter table recommendations enable row level security;
alter table listening_sessions enable row level security;
alter table annotations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where policyname = 'select own reflections'
  ) then
    create policy "select own reflections"
      on reflections for select using (auth.uid() = user_id);
    create policy "insert own reflections"
      on reflections for insert with check (auth.uid() = user_id);
    create policy "update own reflections"
      on reflections for update using (auth.uid() = user_id);
    create policy "delete own reflections"
      on reflections for delete using (auth.uid() = user_id);

    create policy "select own recommendations"
      on recommendations for select using (auth.uid() = user_id);
    create policy "insert own recommendations"
      on recommendations for insert with check (auth.uid() = user_id);
    create policy "update own recommendations"
      on recommendations for update using (auth.uid() = user_id);
    create policy "delete own recommendations"
      on recommendations for delete using (auth.uid() = user_id);

    create policy "select own sessions"
      on listening_sessions for select using (auth.uid() = user_id);
    create policy "insert own sessions"
      on listening_sessions for insert with check (auth.uid() = user_id);
    create policy "update own sessions"
      on listening_sessions for update using (auth.uid() = user_id);
    create policy "delete own sessions"
      on listening_sessions for delete using (auth.uid() = user_id);

    create policy "select own annotations"
      on annotations for select using (auth.uid() = user_id);
    create policy "insert own annotations"
      on annotations for insert with check (auth.uid() = user_id);
    create policy "update own annotations"
      on annotations for update using (auth.uid() = user_id);
    create policy "delete own annotations"
      on annotations for delete using (auth.uid() = user_id);
  end if;
end $$;
