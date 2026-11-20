create extension if not exists pgcrypto;

create table if not exists public.navigator_mandates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  repository text not null check (repository = 'Animic-Protein/Animic-Protein.github.io'),
  capabilities text[] not null check (cardinality(capabilities) between 1 and 12),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  max_requests integer not null check (max_requests between 1 and 12),
  requests_used integer not null default 0 check (requests_used between 0 and max_requests),
  status text not null default 'active' check (status in ('active','revoked','expired','exhausted')),
  revoked_at timestamptz,
  check (expires_at > issued_at)
);

create table if not exists public.navigator_executions (
  request_id text primary key,
  mandate_id uuid not null references public.navigator_mandates(id),
  user_id uuid not null,
  operation text not null,
  repository text not null check (repository = 'Animic-Protein/Animic-Protein.github.io'),
  resource text not null,
  action_digest text not null check (action_digest ~ '^[a-f0-9]{64}$'),
  human_decision text not null check (human_decision = 'approve'),
  human_decided_at timestamptz not null default now(),
  status text not null check (status in ('authorized','executing','executed','failed','denied')),
  result jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  executed_at timestamptz
);

alter table public.navigator_mandates enable row level security;
alter table public.navigator_executions enable row level security;
revoke all on public.navigator_mandates from anon, authenticated;
revoke all on public.navigator_executions from anon, authenticated;
grant all on public.navigator_mandates to service_role;
grant all on public.navigator_executions to service_role;

create or replace function public.navigator_consume_mandate(p_mandate_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  consumed_id uuid;
begin
  update public.navigator_mandates
  set requests_used = requests_used + 1,
      status = case when requests_used + 1 >= max_requests then 'exhausted' else status end
  where id = p_mandate_id
    and user_id = p_user_id
    and status = 'active'
    and expires_at > now()
    and requests_used < max_requests
  returning id into consumed_id;
  return consumed_id is not null;
end;
$$;

revoke all on function public.navigator_consume_mandate(uuid, uuid) from public, anon, authenticated;
grant execute on function public.navigator_consume_mandate(uuid, uuid) to service_role;
