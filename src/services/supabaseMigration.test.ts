import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readMigration() {
  return readFileSync(resolve(process.cwd(), 'supabase/migrations/0002_social_session_commands.sql'), 'utf8');
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
});
