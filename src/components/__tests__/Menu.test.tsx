import React from 'react';
import { render, screen } from '@testing-library/react';
import { Menu } from '../Menu';

// Mock the stores
jest.mock('@/lib/stores/useMonopoly', () => ({
  useMonopoly: () => ({
    phase: 'menu',
    setPhase: jest.fn(),
  }),
}));

describe('Menu Component', () => {
  it('renders menu title', () => {
    render(<Menu />);
    expect(screen.getByText(/nopolies/i)).toBeInTheDocument();
  });

  it('renders start game button', () => {
    render(<Menu />);
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
  });

  it('renders game description', () => {
    render(<Menu />);
    expect(screen.getByText(/3D monopoly game/i)).toBeInTheDocument();
  });
});