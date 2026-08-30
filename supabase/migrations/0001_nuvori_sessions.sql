create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'adapted', 'interrupted', 'cancelled', 'reward_pending')),
  planned_seconds integer not null check (planned_seconds in (300, 600, 900, 1200)),
  invite_token_hash text not null,
  invite_expires_at timestamptz not null default (now() + interval '30 minutes'),
  started_at timestamptz,
  paused_at timestamptz,
  accumulated_pause_seconds integer not null default 0 check (accumulated_pause_seconds >= 0),
  host_presence_deadline_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.session_members (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('host', 'participant')),
  display_name text,
  joined_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create unique index if not exists session_one_host_idx
  on public.session_members (session_id)
  where role = 'host';

create table if not exists public.session_checkins (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  energy integer check (energy between 1 and 3),
  resistance integer check (resistance between 1 and 10),
  mood text,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create table if not exists public.session_outcomes (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  outcome text not null check (outcome in ('normal', 'adapted', 'interrupted')),
  realized_seconds integer not null default 0 check (realized_seconds >= 0),
  pleasure_during integer check (pleasure_during between 1 and 5),
  state_after text,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create table if not exists public.reward_grants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  capsule_type text not null check (capsule_type in ('journey', 'companionship', 'discovery')),
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (session_id, user_id),
  unique (idempotency_key)
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  event_name text not null check (event_name in (
    'invite_created',
    'invite_accepted',
    'session_started',
    'return_session_started',
    'session_ended',
    'reward_failure'
  )),
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists sessions_host_idx on public.sessions (host_user_id, created_at desc);
create index if not exists session_members_user_idx on public.session_members (user_id, joined_at desc);
create index if not exists analytics_user_time_idx on public.analytics_events (user_id, occurred_at desc);

create or replace function public.is_session_member(target_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.session_members
    where session_id = target_session_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_session_host(target_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.sessions
    where id = target_session_id and host_user_id = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.session_members enable row level security;
alter table public.session_checkins enable row level security;
alter table public.session_outcomes enable row level security;
alter table public.reward_grants enable row level security;
alter table public.analytics_events enable row level security;

create policy "authenticated users can read public profiles"
  on public.profiles for select to authenticated
  using (true);

create policy "users can manage their own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "members can read shared sessions"
  on public.sessions for select to authenticated
  using (host_user_id = auth.uid() or public.is_session_member(id));

create policy "hosts can create sessions"
  on public.sessions for insert to authenticated
  with check (host_user_id = auth.uid());

create policy "members can read membership"
  on public.session_members for select to authenticated
  using (user_id = auth.uid() or public.is_session_host(session_id));

create policy "users can join as themselves"
  on public.session_members for insert to authenticated
  with check (user_id = auth.uid() and role = 'participant');

create policy "users can manage own checkins"
  on public.session_checkins for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "users can read own outcomes"
  on public.session_outcomes for select to authenticated
  using (user_id = auth.uid());

create policy "users can read own rewards"
  on public.reward_grants for select to authenticated
  using (user_id = auth.uid());

create policy "users can read own analytics"
  on public.analytics_events for select to authenticated
  using (user_id = auth.uid());
