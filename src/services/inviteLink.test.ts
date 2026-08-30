import { describe, expect, it } from 'vitest';
import { buildInviteLink, parseInviteLink } from './inviteLink';

describe('inviteLink', () => {
  it('builds a shareable web invite and parses web or native links', () => {
    const link = buildInviteLink('https://nuvori.app', 'session-1', 'token-123');

    expect(link).toBe('https://nuvori.app/?session=session-1&invite=token-123');
    expect(parseInviteLink(link)).toEqual({ sessionId: 'session-1', inviteToken: 'token-123' });
    const nativeLink = buildInviteLink('nuvori://session', 'session-1', 'token-123');
    expect(nativeLink).toBe('nuvori://session/?session=session-1&invite=token-123');
    expect(parseInviteLink(nativeLink)).toEqual({ sessionId: 'session-1', inviteToken: 'token-123' });
  });

  it('rejects links without both session and invite parameters', () => {
    expect(parseInviteLink('https://nuvori.app/?session=session-1')).toBeNull();
    expect(parseInviteLink('not a url')).toBeNull();
  });
});
