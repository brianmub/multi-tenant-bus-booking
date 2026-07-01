import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CutoffBadge from './CutoffBadge';

describe('CutoffBadge Component', () => {
  it('should render null if statusInfo is not provided', () => {
    const { container } = render(<CutoffBadge statusInfo={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render standard badge styling and label when OPEN', () => {
    const statusInfo = {
      status: 'OPEN',
      label: 'OPEN',
      color: '#10b981',
      bg: '#dcfce7',
      minsLeft: 90,
    };

    const { container } = render(<CutoffBadge statusInfo={statusInfo} />);
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    
    const badge = container.firstChild;
    expect(badge.style.background).toBe('rgb(220, 252, 231)'); // Hex #dcfce7
    expect(badge.style.color).toBe('rgb(16, 185, 129)'); // Hex #10b981
    
    // Dot check
    const dot = badge.querySelector('span');
    expect(dot.style.animation).toBe('none');
  });

  it('should render pulse animation on dot when status is CLOSING_SOON', () => {
    const statusInfo = {
      status: 'CLOSING_SOON',
      label: 'CLOSING IN 45 MINS',
      color: '#f59e0b',
      bg: '#fef3c7',
      minsLeft: 45,
    };

    const { container } = render(<CutoffBadge statusInfo={statusInfo} />);
    expect(screen.getByText('CLOSING IN 45 MINS')).toBeInTheDocument();

    const badge = container.firstChild;
    const dot = badge.querySelector('span');
    expect(dot.style.animation).toBe('pulse 1.5s infinite');
  });

  it('should render without pulse animation on dot when status is CLOSED', () => {
    const statusInfo = {
      status: 'CLOSED',
      label: 'CLOSED',
      color: '#ef4444',
      bg: '#fee2e2',
      minsLeft: 15,
    };

    const { container } = render(<CutoffBadge statusInfo={statusInfo} />);
    expect(screen.getByText('CLOSED')).toBeInTheDocument();

    const badge = container.firstChild;
    const dot = badge.querySelector('span');
    expect(dot.style.animation).toBe('none');
  });
});
