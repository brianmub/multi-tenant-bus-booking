import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini (will use VITE_GEMINI_API_KEY if present)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * AI Search Assistant - Parses natural language into search parameters
 */
export async function getAiSearch(query, cities) {
  if (!genAI) {
    // Simulated AI response for demo
    return simulateAiSearch(query, cities);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are a bus booking assistant. Parse the following user query into a JSON object.
      Query: "${query}"
      Available Cities: ${cities.join(", ")}
      
      Return ONLY a JSON object with these keys:
      - from (string, must be from available cities or null)
      - to (string, must be from available cities or null)
      - date (string in YYYY-MM-DD format, use ${new Date().toISOString().split('T')[0]} as 'today')
      
      If information is missing, use null.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
  } catch (error) {
    console.error("AI Search Error:", error);
    return simulateAiSearch(query, cities);
  }
}

/**
 * AI Demand Forecast - Predicts demand for a route
 */
export async function getDemandForecast(route) {
  // Simulated ML model output for demo
  // In production, this would call a prediction service
  const baseDemand = 40 + Math.random() * 40; // 40-80%
  const isHoliday = Math.random() > 0.8;
  const multiplier = isHoliday ? 1.4 : 1.0;
  
  return {
    score: Math.min(100, Math.round(baseDemand * multiplier)),
    trend: Math.random() > 0.5 ? "up" : "down",
    recommendation: isHoliday ? "Increase frequency" : "Maintain schedule"
  };
}

/**
 * AI Arrival Predictor
 */
export function getAiEta(currentProgress, startTime, estimatedDuration) {
  // Simulates an AI that considers traffic/delays
  const elapsed = (Date.now() - startTime) / 1000;
  const trafficFactor = 1 + (Math.sin(elapsed / 100) * 0.2); // Simulated traffic variation
  const remaining = (estimatedDuration * (1 - currentProgress / 100)) * trafficFactor;
  
  return {
    minutes: Math.max(0, Math.round(remaining / 60)),
    confidence: 0.85 + (Math.random() * 0.1),
    isDelayed: trafficFactor > 1.1
  };
}

function simulateAiSearch(query, cities) {
  const q = query.toLowerCase();
  const res = { from: null, to: null, date: new Date().toISOString().split('T')[0] };
  
  cities.forEach(city => {
    if (q.includes(city.toLowerCase())) {
      if (!res.from) res.from = city;
      else if (!res.to) res.to = city;
    }
  });
  
  return res;
}
