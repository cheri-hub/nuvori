// @ts-expect-error The prototype intentionally does not depend on @types/node.
import { readFileSync } from 'node:fs';
// @ts-expect-error The prototype intentionally does not depend on @types/node.
import { fileURLToPath } from 'node:url';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';

declare const process: { cwd(): string };

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
    const cssUrl = new URL('../styles/global.css', import.meta.url);
    const cssPath = cssUrl.protocol === 'file:'
      ? fileURLToPath(cssUrl)
      : `${process.cwd()}/src/styles/global.css`;
    const globalCss = readFileSync(cssPath, 'utf8');

    expect(globalCss).toMatch(/:focus-visible\s*\{[\s\S]*outline\s*:\s*[^;]+[\s\S]*\}/);
    expect(globalCss).toMatch(/:focus-visible\s*\{[\s\S]*box-shadow\s*:\s*var\(--focus-ring\)[\s\S]*\}/);
  });
});
