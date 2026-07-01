import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getBusPosition, getRoutePath } from './tracking';

describe('tracking utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getBusPosition', () => {
    it('should return position with expected keys', () => {
      const pos = getBusPosition('Z-101');
      expect(pos).toHaveProperty('lat');
      expect(pos).toHaveProperty('lng');
      expect(pos).toHaveProperty('progress');
      expect(pos).toHaveProperty('status');
      
      expect(typeof pos.lat).toBe('number');
      expect(typeof pos.lng).toBe('number');
      expect(typeof pos.progress).toBe('number');
      expect(typeof pos.status).toBe('string');
    });

    it('should change position and progress deterministically over time', () => {
      // 0 seconds elapsed -> progress 0
      const pos0 = getBusPosition('Z-101');
      expect(pos0.progress).toBe(0);
      expect(pos0.status).toBe('Departing');

      // Advance 150 seconds (halfway through 300 second period)
      vi.advanceTimersByTime(150000);
      const pos150 = getBusPosition('Z-101');
      expect(pos150.progress).toBe(50);
      expect(pos150.status).toBe('En Route');

      // Advance another 130 seconds (total 280 seconds, progress 93%)
      vi.advanceTimersByTime(130000);
      const pos280 = getBusPosition('Z-101');
      expect(pos280.progress).toBe(93);
      expect(pos280.status).toBe('Arrived');

      // Advance another 20 seconds (total 300 seconds, resets progress to 0)
      vi.advanceTimersByTime(20000);
      const pos300 = getBusPosition('Z-101');
      expect(pos300.progress).toBe(0);
      expect(pos300.status).toBe('Departing');
    });
  });

  describe('getRoutePath', () => {
    it('should return an array of coordinate points', () => {
      const path = getRoutePath('Harare', 'Bulawayo');
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBe(3);
      path.forEach(pt => {
        expect(pt).toHaveProperty('lat');
        expect(pt).toHaveProperty('lng');
        expect(typeof pt.lat).toBe('number');
        expect(typeof pt.lng).toBe('number');
      });
    });
  });
});
