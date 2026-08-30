create or replace function public.create_solo_session(p_planned_seconds integer)
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

  insert into public.sessions (host_user_id, planned_seconds, invite_token_hash, invite_expires_at)
  values (auth.uid(), p_planned_seconds, encode(digest(gen_random_uuid()::text, 'sha256'), 'hex'), now())
  returning * into v_session;

  select display_name into v_display_name from public.profiles where id = auth.uid();
  insert into public.session_members (session_id, user_id, role, display_name)
  values (v_session.id, auth.uid(), 'host', coalesce(v_display_name, 'Nuvori'));

  return jsonb_build_object('session', public.session_snapshot(v_session.id));
end;
$$;

create or replace function public.start_solo_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions;
  v_is_return boolean;
begin
  select * into v_session from public.sessions where id = p_session_id for update;
  if not found then raise exception 'session not found' using errcode = 'P0002'; end if;
  if v_session.host_user_id <> auth.uid() then raise exception 'only the host can start the session' using errcode = '42501'; end if;
  if v_session.status <> 'pending' then raise exception 'session must be pending' using errcode = '55000'; end if;
  if (select count(*) from public.session_members where session_id = p_session_id) <> 1 then
    raise exception 'solo session must have one member' using errcode = '55000';
  end if;

  select exists (
    select 1 from public.analytics_events
    where user_id = auth.uid() and event_name = 'session_started'
      and occurred_at between now() - interval '7 days' and now()
  ) into v_is_return;

  update public.sessions
  set status = 'active', started_at = now(), host_presence_deadline_at = now() + interval '60 seconds'
  where id = p_session_id;

  insert into public.analytics_events (user_id, session_id, event_name)
  values (auth.uid(), p_session_id, 'session_started');
  if v_is_return then
    insert into public.analytics_events (user_id, session_id, event_name, properties)
    values (auth.uid(), p_session_id, 'return_session_started', jsonb_build_object('window_days', 7));
  end if;
  return public.session_snapshot(p_session_id);
end;
$$;

grant execute on function public.create_solo_session(integer) to authenticated;
grant execute on function public.start_solo_session(uuid) to authenticated;

alter table public.session_checkins drop constraint if exists session_checkins_energy_check;
alter table public.session_checkins add constraint session_checkins_energy_check check (energy between 1 and 5);
