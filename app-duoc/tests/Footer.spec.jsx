import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../src/Components/Footer';

describe('Footer', () => {
  it('renderiza texto', () => {
    render(<Footer />);
    expect(screen.getByText(/Level-Up Gamer/i)).toBeInTheDocument();
    expect(screen.getByText(/Duoc UC/i)).toBeInTheDocument();
  });
});