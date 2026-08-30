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
  where s.id = target_session_id
    and (s.host_user_id = auth.uid() or public.is_session_member(s.id));
$$;
