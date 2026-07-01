import { describe, it, expect } from 'vitest';
import { convert, fmt, fmtConverted, CURRENCIES } from './currency';

describe('currency utility', () => {
  describe('convert', () => {
    it('should convert USD to target currency using fallback exchange rates', () => {
      expect(convert(10, 'USD')).toBe(10);
      expect(convert(10, 'ZAR')).toBe(185); // 10 * 18.50
      expect(convert(10, 'BWP')).toBe(136); // 10 * 13.60
    });

    it('should default to USD rate if target currency is unrecognized', () => {
      expect(convert(10, 'EUR')).toBe(10);
    });
  });

  describe('fmt', () => {
    it('should format USD amounts correctly', () => {
      expect(fmt(1250, 'USD')).toBe('$1,250.00');
    });

    it('should format ZAR amounts correctly', () => {
      expect(fmt(1250, 'ZAR')).toBe('R1,250.00');
    });

    it('should format BWP amounts correctly', () => {
      expect(fmt(1250, 'BWP')).toBe('P1,250.00');
    });

    it('should fallback to USD format if currency is unrecognized', () => {
      expect(fmt(1250, 'GBP')).toBe('$1,250.00');
    });
  });

  describe('fmtConverted', () => {
    it('should convert and format in one step', () => {
      expect(fmtConverted(10, 'ZAR')).toBe('R185.00');
      expect(fmtConverted(10, 'USD')).toBe('$10.00');
    });
  });

  describe('CURRENCIES definition', () => {
    it('should contain USD, ZAR, and BWP definitions', () => {
      expect(CURRENCIES).toHaveLength(3);
      expect(CURRENCIES.find(c => c.id === 'USD')).toEqual({ id: 'USD', symbol: '$', label: 'US Dollar' });
      expect(CURRENCIES.find(c => c.id === 'ZAR')).toEqual({ id: 'ZAR', symbol: 'R', label: 'SA Rand (ZAR)' });
      expect(CURRENCIES.find(c => c.id === 'BWP')).toEqual({ id: 'BWP', symbol: 'P', label: 'Botswana Pula' });
    });
  });
});
