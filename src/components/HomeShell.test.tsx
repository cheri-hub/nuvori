import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('Home shell', () => {
  it('shows the product, direct start action, and secondary social action', () => {
    render(<App />);
    expect(screen.getByText('NUVORI')).toBeVisible();
    expect(screen.getByRole('button', { name: /Comecar 5 min/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Convidar alguem/i })).toBeVisible();
  });
});
