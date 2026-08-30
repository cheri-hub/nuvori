import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';

afterEach(cleanup);

describe('Home accessibility regressions', () => {
  it('gives the primary and secondary home actions accessible names', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /Comecar 5 min/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Convidar alguem/i })).toBeVisible();
  });

  it('gives every sheet a heading and an accessible close action', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Comecar 5 min/i }));
    const checkIn = screen.getByRole('dialog');
    expect(checkIn.querySelector('h2')).toBeTruthy();
    expect(checkIn).toHaveAttribute('aria-labelledby', 'checkin-title');
    expect(within(checkIn).getByRole('button', { name: 'Fechar' })).toBeVisible();

    fireEvent.click(within(checkIn).getByRole('button', { name: 'Fechar' }));
    fireEvent.click(screen.getByRole('button', { name: /Convidar alguem/i }));
    const invite = screen.getByRole('dialog');
    expect(invite.querySelector('h2')).toBeTruthy();
    expect(invite).toHaveAttribute('aria-labelledby', 'invite-title');
    expect(within(invite).getByRole('button', { name: 'Fechar' })).toBeVisible();
  });

  it('keeps a visible focus contract on the primary CTA', () => {
    render(<App />);
    const primary = screen.getByRole('button', { name: /Comecar 5 min/i });
    primary.focus();
    expect(primary).toHaveClass('primary-action');
    expect(primary).toHaveFocus();
    expect(primary).not.toHaveAttribute('tabindex', '-1');
  });

  it('defines a visible focus ring in the global focus-visible rule', () => {
    const resolveModule = (import.meta as ImportMeta & { resolve?: (specifier: string) => string }).resolve;
    const cssUrl = resolveModule?.('../styles/global.css') ?? new URL('../styles/global.css', import.meta.url).href;
    const cssPath = fileURLToPath(cssUrl);
    const globalCss = readFileSync(cssPath, 'utf8');

    expect(globalCss).toMatch(/:focus-visible\s*\{[\s\S]*outline\s*:\s*[^;]+[\s\S]*\}/);
    expect(globalCss).toMatch(/:focus-visible\s*\{[\s\S]*box-shadow\s*:\s*var\(--focus-ring\)[\s\S]*\}/);
  });

  it.each([
    { trigger: /Comecar 5 min/i, title: /check-in/i },
    { trigger: /Convidar alguem/i, title: /convidar alguem/i },
  ])('moves focus into $title, traps Tab, closes on Escape, and restores the trigger', async ({ trigger, title }) => {
    render(<App />);
    const triggerButton = screen.getByRole('button', { name: trigger });
    triggerButton.focus();
    fireEvent.click(triggerButton);

    const dialog = screen.getByRole('dialog', { name: title });
    const closeButton = within(dialog).getByRole('button', { name: 'Fechar' });
    expect(closeButton).toHaveFocus();
    expect(document.querySelector('.app-header')).toHaveAttribute('aria-hidden', 'true');
    expect(document.querySelector('.bottom-nav')).toHaveAttribute('aria-hidden', 'true');

    const buttons = within(dialog).getAllByRole('button');
    buttons.at(-1)?.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(screen.getByRole('button', { name: trigger })).toHaveFocus());
    expect(document.querySelector('.app-header')).not.toHaveAttribute('aria-hidden');
    expect(document.querySelector('.bottom-nav')).not.toHaveAttribute('aria-hidden');
  });
});
