import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readMigration(name = '0002_social_session_commands.sql') {
  return readFileSync(resolve(process.cwd(), `supabase/migrations/${name}`), 'utf8');
}

describe('social session command migration', () => {
  it('defines the protected lifecycle RPCs', () => {
    const sql = readMigration();

    for (const functionName of [
      'create_social_session',
      'join_social_session',
      'start_social_session',
      'pause_social_session',
      'resume_social_session',
      'end_social_session',
    ]) {
      expect(sql).toContain(`function public.${functionName}`);
    }
    expect(sql).toContain('security definer');
    expect(sql).toContain('invite_expires_at');
    expect(sql).toContain('on conflict (session_id, user_id) do nothing');
  });

  it('records seven-day returns and publishes shared tables to Realtime', () => {
    const sql = readMigration();

    expect(sql).toContain("'return_session_started'");
    expect(sql).toContain("'sessions'");
    expect(sql).toContain("'session_members'");
    expect(sql).toContain('supabase_realtime');
  });

  it('limits snapshots to the host or a session member', () => {
    const sql = readMigration('0003_harden_session_snapshot.sql');

    expect(sql).toContain('s.host_user_id = auth.uid() or public.is_session_member(s.id)');
  });
});

describe('solo session command migration', () => {
  it('defines protected solo lifecycle RPCs and records returns', () => {
    const sql = readMigration('0004_solo_session_commands.sql');

    expect(sql).toContain('function public.create_solo_session');
    expect(sql).toContain('function public.start_solo_session');
    expect(sql).toContain("'return_session_started'");
    expect(sql).toContain('grant execute on function public.start_solo_session');
    expect(sql).toContain('energy between 1 and 5');
  });
});
