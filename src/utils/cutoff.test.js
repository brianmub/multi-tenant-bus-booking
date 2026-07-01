import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCutoffStatus } from './cutoff';

describe('cutoff utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set system time to 12:00 PM (noon) today
    vi.setSystemTime(new Date(2026, 5, 2, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return OPEN status when departure is far in the future', () => {
    // Departure at 1:30 PM (90 mins in the future)
    const result = getCutoffStatus('01:30 PM', { bookingCutoffMins: 30, closingSoonMins: 60 });
    expect(result.status).toBe('OPEN');
    expect(result.label).toBe('OPEN');
    expect(result.color).toBe('#10b981');
    expect(result.minsLeft).toBe(90);
  });

  it('should return CLOSING_SOON status when departure is within closingSoonMins but after bookingCutoffMins', () => {
    // Departure at 12:45 PM (45 mins in the future)
    const result = getCutoffStatus('12:45 PM', { bookingCutoffMins: 30, closingSoonMins: 60 });
    expect(result.status).toBe('CLOSING_SOON');
    expect(result.label).toBe('CLOSING IN 45 MINS');
    expect(result.color).toBe('#f59e0b');
    expect(result.minsLeft).toBe(45);
  });

  it('should return CLOSED status when departure is within bookingCutoffMins', () => {
    // Departure at 12:15 PM (15 mins in the future)
    const result = getCutoffStatus('12:15 PM', { bookingCutoffMins: 30, closingSoonMins: 60 });
    expect(result.status).toBe('CLOSED');
    expect(result.label).toBe('CLOSED');
    expect(result.color).toBe('#ef4444');
    expect(result.minsLeft).toBe(15);
  });

  it('should use default configuration if none provided', () => {
    // Default cutoff is 30 mins, closingSoon is 60 mins.
    // Departure at 12:15 PM (15 mins left) -> CLOSED
    const closedRes = getCutoffStatus('12:15 PM');
    expect(closedRes.status).toBe('CLOSED');

    // Departure at 12:45 PM (45 mins left) -> CLOSING_SOON
    const closingSoonRes = getCutoffStatus('12:45 PM');
    expect(closingSoonRes.status).toBe('CLOSING_SOON');

    // Departure at 01:15 PM (75 mins left) -> OPEN
    const openRes = getCutoffStatus('01:15 PM');
    expect(openRes.status).toBe('OPEN');
  });
});
