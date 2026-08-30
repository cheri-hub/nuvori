create or replace function public.revoke_social_invite(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.sessions;
begin
  select * into v_session from public.sessions where id = p_session_id for update;
  if not found then raise exception 'session not found' using errcode = 'P0002'; end if;
  if v_session.host_user_id <> auth.uid() then raise exception 'only the host can revoke this invite' using errcode = '42501'; end if;
  if v_session.status <> 'pending' then raise exception 'only a pending invite can be revoked' using errcode = '55000'; end if;

  update public.sessions
  set status = 'cancelled', ended_at = now()
  where id = p_session_id;

  return public.session_snapshot(p_session_id);
end;
$$;

grant execute on function public.revoke_social_invite(uuid) to authenticated;
