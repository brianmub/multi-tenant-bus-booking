import { describe, it, expect } from 'vitest';
import { getFleet, getBusDetails, FLEET_REGISTRY } from './fleet';

describe('fleet utility', () => {
  describe('getFleet', () => {
    it('should return the correct fleet for registered tenants', () => {
      const zupcoFleet = getFleet('zupco');
      expect(zupcoFleet).toEqual(FLEET_REGISTRY.zupco);
      expect(zupcoFleet.length).toBeGreaterThan(0);

      const swiftFleet = getFleet('swift');
      expect(swiftFleet).toEqual(FLEET_REGISTRY.swift);

      const horizonFleet = getFleet('horizon');
      expect(horizonFleet).toEqual(FLEET_REGISTRY.horizon);
    });

    it('should return an empty array for unregistered or null tenants', () => {
      expect(getFleet('nonexistent')).toEqual([]);
      expect(getFleet(null)).toEqual([]);
      expect(getFleet()).toEqual([]);
    });
  });

  describe('getBusDetails', () => {
    it('should return details for an existing bus ID', () => {
      const details = getBusDetails('Z-101');
      expect(details).toBeDefined();
      expect(details.reg).toBe('B 201 AA');
      expect(details.model).toBe('Yutong ZK6122H');
      expect(details.capacity).toBe(62);
      expect(details.status).toBe('active');
      expect(details.class).toBe('Standard');
    });

    it('should return undefined for a nonexistent bus ID', () => {
      expect(getBusDetails('XYZ-999')).toBeUndefined();
      expect(getBusDetails(null)).toBeUndefined();
      expect(getBusDetails()).toBeUndefined();
    });
  });
});
