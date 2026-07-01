import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAiSearch, getDemandForecast, getAiEta } from './ai';

// Define a mock generator function we can control in tests
const mockGenerateContent = vi.fn();

// Mock @google/generative-ai module
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      constructor(apiKey) {
        this.apiKey = apiKey;
      }
      getGenerativeModel() {
        return {
          generateContent: mockGenerateContent,
        };
      }
    },
  };
});

describe('AI Utility', () => {
  const cities = ['Harare', 'Bulawayo', 'Mutare'];

  describe('getAiSearch', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Suppress console.error to keep test output clean when testing error paths
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should parse search query using generative AI when API is successful', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({ from: 'Harare', to: 'Bulawayo', date: '2026-06-02' }),
        },
      });

      const result = await getAiSearch('Harare to Bulawayo', cities);
      expect(result).toEqual({ from: 'Harare', to: 'Bulawayo', date: '2026-06-02' });
    });

    it('should fall back to simulated parsing if Gemini AI API throws an error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API failure'));

      const result = await getAiSearch('I want to travel from Harare to Mutare', cities);
      expect(result.from).toBe('Harare');
      expect(result.to).toBe('Mutare');
    });

    it('should fall back to current date in simulated parsing if date not mentioned in query', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API failure'));

      const result = await getAiSearch('trip from Bulawayo', cities);
      expect(result.from).toBe('Bulawayo');
      expect(result.to).toBeNull();
      expect(result.date).toBe(new Date().toISOString().split('T')[0]);
    });
  });

  describe('getDemandForecast', () => {
    it('should return a valid demand score, trend, and recommendation', async () => {
      const forecast = await getDemandForecast('Harare - Mutare');
      expect(forecast.score).toBeGreaterThanOrEqual(0);
      expect(forecast.score).toBeLessThanOrEqual(100);
      expect(['up', 'down']).toContain(forecast.trend);
      expect(typeof forecast.recommendation).toBe('string');
    });
  });

  describe('getAiEta', () => {
    it('should calculate ETA based on progress, start time, and estimated duration', () => {
      const startTime = Date.now() - 30 * 60 * 1000; // 30 mins ago
      const estimatedDuration = 120 * 60; // 2 hours in seconds
      const currentProgress = 25; // 25% progress

      const eta = getAiEta(currentProgress, startTime, estimatedDuration);
      expect(eta).toHaveProperty('minutes');
      expect(eta).toHaveProperty('confidence');
      expect(eta).toHaveProperty('isDelayed');
      expect(eta.minutes).toBeGreaterThanOrEqual(0);
      expect(eta.confidence).toBeGreaterThanOrEqual(0.85);
    });
  });
});
