import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from '../src/App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    window.dispatchEvent(new Event('storage'));
  });

  it('renderiza header y footer', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getAllByText(/LEVEL-UP/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Duoc UC/i)).toBeInTheDocument();
  });
});