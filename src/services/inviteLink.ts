export type InviteLink = {
  sessionId: string;
  inviteToken: string;
};

export function buildInviteLink(origin: string, sessionId: string, inviteToken: string): string {
  const url = new URL('/', origin);
  url.searchParams.set('session', sessionId);
  url.searchParams.set('invite', inviteToken);
  return url.toString();
}

export function parseInviteLink(rawUrl: string): InviteLink | null {
  try {
    const url = new URL(rawUrl, 'https://nuvori.local');
    const sessionId = url.searchParams.get('session')?.trim();
    const inviteToken = url.searchParams.get('invite')?.trim();
    return sessionId && inviteToken ? { sessionId, inviteToken } : null;
  } catch {
    return null;
  }
}
