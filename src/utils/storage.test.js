import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveBooking, getBookings, getAllBookings, getOccupancy, clearBookings } from './storage';

describe('storage service', () => {
  beforeEach(() => {
    clearBookings();
    vi.useFakeTimers();
  });

  afterEach(() => {
    clearBookings();
    vi.useRealTimers();
  });

  it('should start with an empty list of bookings', () => {
    expect(getAllBookings()).toEqual([]);
  });

  it('should save and retrieve a booking', () => {
    vi.setSystemTime(new Date('2026-06-02T12:00:00Z'));
    const booking = {
      tenantId: 'zupco',
      busId: 'Z-101',
      seats: [1, 2],
      passengerName: 'John Doe',
    };

    const saved = saveBooking(booking);
    expect(saved.id).toMatch(/^ETZ-\d{6}$/);
    expect(saved.timestamp).toBe('2026-06-02T12:00:00.000Z');
    expect(saved.tenantId).toBe('zupco');
    expect(saved.seats).toEqual([1, 2]);

    const all = getAllBookings();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(saved.id);
  });

  it('should get bookings for a specific tenant sorted by timestamp descending', () => {
    vi.setSystemTime(new Date('2026-06-02T10:00:00Z'));
    saveBooking({ tenantId: 'zupco', busId: 'Z-101', seats: [1] });

    vi.setSystemTime(new Date('2026-06-02T11:00:00Z'));
    const secondBooking = saveBooking({ tenantId: 'zupco', busId: 'Z-101', seats: [2] });

    // Different tenant
    vi.setSystemTime(new Date('2026-06-02T12:00:00Z'));
    saveBooking({ tenantId: 'swift', busId: 'S-201', seats: [3] });

    const zupcoBookings = getBookings('zupco');
    expect(zupcoBookings).toHaveLength(2);
    // Should be sorted descending by timestamp
    expect(zupcoBookings[0].id).toBe(secondBooking.id);

    const swiftBookings = getBookings('swift');
    expect(swiftBookings).toHaveLength(1);
  });

  it('should calculate occupancy for a specific bus on a target date', () => {
    // Save booking on June 2
    vi.setSystemTime(new Date('2026-06-02T10:00:00Z'));
    saveBooking({ tenantId: 'zupco', busId: 'Z-101', seats: [1, 2] });

    // Save booking on June 3
    vi.setSystemTime(new Date('2026-06-03T10:00:00Z'));
    saveBooking({ tenantId: 'zupco', busId: 'Z-101', seats: [3, 4, 5] });

    // Save booking on June 2 for a different bus
    vi.setSystemTime(new Date('2026-06-02T11:00:00Z'));
    saveBooking({ tenantId: 'zupco', busId: 'Z-102', seats: [6] });

    // Occupancy for Z-101 on June 2 should be 2
    expect(getOccupancy('Z-101', '2026-06-02')).toBe(2);

    // Occupancy for Z-101 on June 3 should be 3
    expect(getOccupancy('Z-101', '2026-06-03')).toBe(3);

    // Occupancy for Z-102 on June 2 should be 1
    expect(getOccupancy('Z-102', '2026-06-02')).toBe(1);

    // Occupancy for Z-101 on another date should be 0
    expect(getOccupancy('Z-101', '2026-06-04')).toBe(0);
  });

  it('should handle JSON parse errors gracefully and return empty array', () => {
    localStorage.setItem('ETZ_BUS_BOOKINGS', 'invalid-json');
    expect(getAllBookings()).toEqual([]);
  });
});
