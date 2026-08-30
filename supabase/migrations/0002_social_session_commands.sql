create or replace function public.session_snapshot(target_session_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', s.id,
    'host_user_id', s.host_user_id,
    'status', s.status,
    'planned_seconds', s.planned_seconds,
    'invite_expires_at', s.invite_expires_at,
    'started_at', s.started_at,
    'paused_at', s.paused_at,
    'accumulated_pause_seconds', s.accumulated_pause_seconds,
    'host_presence_deadline_at', s.host_presence_deadline_at,
    'ended_at', s.ended_at,
    'created_at', s.created_at,
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', m.user_id,
        'role', m.role,
        'display_name', m.display_name,
        'joined_at', m.joined_at
      ) order by m.joined_at)
      from public.session_members m
      where m.session_id = s.id
    ), '[]'::jsonb),
    'rewards', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', r.id,
        'user_id', r.user_id,
        'session_id', r.session_id,
        'capsule_type', r.capsule_type
      ) order by r.created_at)
      from public.reward_grants r
      where r.session_id = s.id and r.user_id = auth.uid()
    ), '[]'::jsonb)
  )
  from public.sessions s
  where s.id = target_session_id;
$$;

create or replace function public.create_social_session(
  p_planned_seconds integer,
  p_invite_token text,
  p_invite_expires_at timestamptz default (now() + interval '30 minutes')
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions;
  v_display_name text;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if p_planned_seconds not in (300, 600, 900, 1200) then
    raise exception 'planned duration is not supported' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_invite_token, ''))) < 16 then
    raise exception 'invite token is too short' using errcode = '22023';
  end if;

  insert into public.sessions (host_user_id, planned_seconds, invite_token_hash, invite_expires_at)
  values (auth.uid(), p_planned_seconds, encode(digest(p_invite_token, 'sha256'), 'hex'), p_invite_expires_at)
  returning * into v_session;

  select display_name into v_display_name from public.profiles where id = auth.uid();
  insert into public.session_members (session_id, user_id, role, display_name)
  values (v_session.id, auth.uid(), 'host', coalesce(v_display_name, 'Anfitriao'));

  insert into public.analytics_events (user_id, session_id, event_name, properties)
  values (auth.uid(), v_session.id, 'invite_created', jsonb_build_object('planned_seconds', p_planned_seconds));

  return jsonb_build_object('session', public.session_snapshot(v_session.id), 'invite_token', p_invite_token);
end;
$$;

create or replace function public.join_social_session(
  p_session_id uuid,
  p_invite_token text,
  p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  select * into v_session from public.sessions where id = p_session_id for update;
  if not found then raise exception 'session not found' using errcode = 'P0002'; end if;
  if v_session.status <> 'pending' then raise exception 'session is no longer accepting participants' using errcode = '55000'; end if;
  if v_session.invite_expires_at <= now() then raise exception 'invite has expired' using errcode = '57014'; end if;
  if v_session.invite_token_hash <> encode(digest(p_invite_token, 'sha256'), 'hex') then raise exception 'invite token is invalid' using errcode = '22023'; end if;
  if exists (select 1 from public.session_members where session_id = p_session_id and user_id = auth.uid()) then
    return public.session_snapshot(p_session_id);
  end if;
  if (select count(*) from public.session_members where session_id = p_session_id) >= 2 then
    raise exception 'session already has two members' using errcode = '54000';
  end if;

  insert into public.session_members (session_id, user_id, role, display_name)
  values (p_session_id, auth.uid(), 'participant', nullif(trim(p_display_name), ''));
  insert into public.analytics_events (user_id, session_id, event_name)
  values (auth.uid(), p_session_id, 'invite_accepted');
  return public.session_snapshot(p_session_id);
end;
$$;

create or replace function public.start_social_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions;
  v_is_return boolean;
  v_member record;
begin
  select * into v_session from public.sessions where id = p_session_id for update;
  if not found then raise exception 'session not found' using errcode = 'P0002'; end if;
  if v_session.host_user_id <> auth.uid() then raise exception 'only the host can start the session' using errcode = '42501'; end if;
  if v_session.status <> 'pending' then raise exception 'session must be pending' using errcode = '55000'; end if;
  if (select count(*) from public.session_members where session_id = p_session_id) <> 2 then
    raise exception 'social session needs two members' using errcode = '55000';
  end if;

  update public.sessions
  set status = 'active', started_at = now(), host_presence_deadline_at = now() + interval '60 seconds'
  where id = p_session_id;
  for v_member in select user_id from public.session_members where session_id = p_session_id loop
    select exists (
      select 1 from public.analytics_events
      where user_id = v_member.user_id and event_name = 'session_started'
        and occurred_at between now() - interval '7 days' and now()
    ) into v_is_return;
    insert into public.analytics_events (user_id, session_id, event_name)
    values (v_member.user_id, p_session_id, 'session_started');
    if v_is_return then
      insert into public.analytics_events (user_id, session_id, event_name, properties)
      values (v_member.user_id, p_session_id, 'return_session_started', jsonb_build_object('window_days', 7));
    end if;
  end loop;
  return public.session_snapshot(p_session_id);
end;
$$;

create or replace function public.pause_social_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.sessions where id = p_session_id and host_user_id = auth.uid() and status = 'active' and paused_at is null) then
    raise exception 'only an active host can pause this session' using errcode = '42501';
  end if;
  update public.sessions set paused_at = now(), host_presence_deadline_at = now() + interval '60 seconds' where id = p_session_id;
  return public.session_snapshot(p_session_id);
end;
$$;

create or replace function public.resume_social_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.sessions where id = p_session_id and host_user_id = auth.uid() and status = 'active' and paused_at is not null) then
    raise exception 'only a paused active host can resume this session' using errcode = '42501';
  end if;
  update public.sessions
  set accumulated_pause_seconds = accumulated_pause_seconds + extract(epoch from (now() - paused_at))::integer,
      paused_at = null, host_presence_deadline_at = now() + interval '60 seconds'
  where id = p_session_id;
  return public.session_snapshot(p_session_id);
end;
$$;

create or replace function public.end_social_session(p_session_id uuid, p_outcome text, p_idempotency_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions;
  v_realized_seconds integer;
  v_member record;
begin
  select * into v_session from public.sessions where id = p_session_id for update;
  if not found then raise exception 'session not found' using errcode = 'P0002'; end if;
  if v_session.host_user_id <> auth.uid() then raise exception 'only the host can end the session' using errcode = '42501'; end if;
  if p_outcome not in ('normal', 'adapted', 'interrupted') then raise exception 'invalid session outcome' using errcode = '22023'; end if;
  if v_session.status in ('completed', 'adapted', 'interrupted', 'cancelled') then return public.session_snapshot(p_session_id); end if;
  if v_session.status <> 'active' then raise exception 'session must be active' using errcode = '55000'; end if;

  v_realized_seconds := greatest(0, extract(epoch from (now() - v_session.started_at))::integer - v_session.accumulated_pause_seconds);
  if v_session.paused_at is not null then
    v_realized_seconds := greatest(0, extract(epoch from (v_session.paused_at - v_session.started_at))::integer - v_session.accumulated_pause_seconds);
  end if;
  if p_outcome = 'normal' and v_realized_seconds < v_session.planned_seconds then
    raise exception 'normal completion requires the planned duration' using errcode = '55000';
  end if;

  update public.sessions
  set status = case p_outcome when 'normal' then 'completed' when 'adapted' then 'adapted' else 'interrupted' end,
      ended_at = now(), paused_at = null
  where id = p_session_id;

  for v_member in select user_id from public.session_members where session_id = p_session_id loop
    insert into public.session_outcomes (session_id, user_id, outcome, realized_seconds)
    values (p_session_id, v_member.user_id, p_outcome, v_realized_seconds)
    on conflict (session_id, user_id) do nothing;
    if p_outcome in ('normal', 'adapted') then
      insert into public.reward_grants (session_id, user_id, capsule_type, idempotency_key)
      values (p_session_id, v_member.user_id, case when p_outcome = 'normal' then 'journey' else 'companionship' end, p_idempotency_key || ':' || v_member.user_id::text)
      on conflict (session_id, user_id) do nothing;
    end if;
  end loop;
  insert into public.analytics_events (user_id, session_id, event_name, properties)
  values (auth.uid(), p_session_id, 'session_ended', jsonb_build_object('outcome', p_outcome, 'realized_seconds', v_realized_seconds));
  return public.session_snapshot(p_session_id);
end;
$$;

grant execute on function public.session_snapshot(uuid) to authenticated;
grant execute on function public.create_social_session(integer, text, timestamptz) to authenticated;
grant execute on function public.join_social_session(uuid, text, text) to authenticated;
grant execute on function public.start_social_session(uuid) to authenticated;
grant execute on function public.pause_social_session(uuid) to authenticated;
grant execute on function public.resume_social_session(uuid) to authenticated;
grant execute on function public.end_social_session(uuid, text, text) to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sessions') then
    alter publication supabase_realtime add table public.sessions;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'session_members') then
    alter publication supabase_realtime add table public.session_members;
  end if;
end;
$$;
