import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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
});
