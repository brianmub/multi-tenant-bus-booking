/**
 * Real-time Vehicle Tracking Simulation.
 * Generates virtual GPS coordinates for fleet monitoring.
 */

const START_TIME = Date.now();

/**
 * Calculates a simulated position between two cities.
 * @param {string} busId 
 * @returns {object} { lat, lng, progress }
 */
export function getBusPosition(busId) {
  // Simple deterministic simulation based on time
  const elapsed = (Date.now() - START_TIME) / 1000; // seconds
  const period = 300; // 5 minute cycle for demo
  const progress = (elapsed % period) / period;

  // Mock coordinates for Southern Africa region
  // Centered around Johannesburg/Harare area
  const baseLat = -26.2041;
  const baseLng = 28.0473;
  
  // Create a slight path movement
  const lat = baseLat + (progress * 5); 
  const lng = baseLng + (Math.sin(progress * Math.PI) * 2);

  return {
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6)),
    progress: Math.round(progress * 100),
    status: progress > 0.9 ? "Arrived" : progress > 0.1 ? "En Route" : "Departing"
  };
}

/**
 * Gets the route path (simulated)
 */
export function getRoutePath(from, to) {
  // For demo, just return a few points
  return [
    { lat: -26.2041, lng: 28.0473 },
    { lat: -22.9576, lng: 30.4850 },
    { lat: -17.8252, lng: 31.0335 }
  ];
}
