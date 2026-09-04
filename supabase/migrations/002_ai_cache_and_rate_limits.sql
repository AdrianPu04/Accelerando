-- Run in Supabase SQL Editor after 001_initial.sql.

create table if not exists shared_annotation_cache (
  cache_key text primary key,
  piece_id text not null,
  annotations jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shared_annotation_cache_piece_id
  on shared_annotation_cache (piece_id);

create table if not exists api_rate_limits (
  bucket_key text primary key,
  count integer not null default 0,
  reset_at bigint not null
);

alter table shared_annotation_cache enable row level security;
alter table api_rate_limits enable row level security;

-- No anon/authenticated policies: only the service role can read/write these tables.

create or replace function hit_rate_limit(
  p_key text,
  p_limit integer,
  p_window_ms bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  current_count integer;
  current_reset bigint;
  retry_after_ms bigint;
begin
  select count, reset_at
    into current_count, current_reset
  from api_rate_limits
  where bucket_key = p_key
  for update;

  if not found or now_ms >= current_reset then
    insert into api_rate_limits (bucket_key, count, reset_at)
    values (p_key, 1, now_ms + p_window_ms)
    on conflict (bucket_key) do update
      set count = 1,
          reset_at = excluded.reset_at;

    return jsonb_build_object(
      'allowed', true,
      'remaining', greatest(p_limit - 1, 0),
      'retry_after_ms', 0
    );
  end if;

  if current_count >= p_limit then
    retry_after_ms := greatest(current_reset - now_ms, 0);
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retry_after_ms', retry_after_ms
    );
  end if;

  update api_rate_limits
    set count = current_count + 1
  where bucket_key = p_key;

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(p_limit - current_count - 1, 0),
    'retry_after_ms', 0
  );
end;
$$;

revoke all on function hit_rate_limit(text, integer, bigint) from public;
grant execute on function hit_rate_limit(text, integer, bigint) to service_role;
