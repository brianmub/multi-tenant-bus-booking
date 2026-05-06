/**
 * Storage service for multi-tenant bus booking platform.
 * Simulates a database using localStorage.
 */

const STORAGE_KEY = "ETZ_BUS_BOOKINGS";

/**
 * Saves a new booking to storage
 */
export function saveBooking(booking) {
  const bookings = getAllBookings();
  const newBooking = {
    ...booking,
    id: `ETZ-${Math.floor(Math.random() * 900000) + 100000}`,
    timestamp: new Date().toISOString(),
  };
  
  bookings.push(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return newBooking;
}

/**
 * Retrieves bookings for a specific tenant
 */
export function getBookings(tenantId) {
  const all = getAllBookings();
  return all
    .filter(b => b.tenantId === tenantId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Retrieves all bookings (Admin View)
 */
export function getAllBookings() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse bookings", e);
    return [];
  }
}

/**
 * Calculates the number of occupied seats for a specific bus on a date.
 */
export function getOccupancy(busId, date) {
  const bookings = getAllBookings();
  // Filter by bus and same calendar day
  const filtered = bookings.filter(b => {
    const bookingDate = new Date(b.timestamp).toDateString();
    const targetDate = new Date(date).toDateString();
    return b.busId === busId && bookingDate === targetDate;
  });

  return filtered.reduce((total, b) => total + b.seats.length, 0);
}

/**
 * Helper to clear bookings (for testing)
 */
export function clearBookings() {
  localStorage.removeItem(STORAGE_KEY);
}
