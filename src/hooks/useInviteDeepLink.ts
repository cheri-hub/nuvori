import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';
import type { InviteLink } from '../services/inviteLink';
import { parseInviteLink } from '../services/inviteLink';

export function useInviteDeepLink(onInvite: (invite: InviteLink) => void): void {
  const callbackRef = useRef(onInvite);
  callbackRef.current = onInvite;

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    const listener = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      const invite = parseInviteLink(url);
      if (invite) callbackRef.current(invite);
    });
    return () => { void listener.then((handle) => handle.remove()); };
  }, []);
}
