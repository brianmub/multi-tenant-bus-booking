import { supabase } from "./supabaseClient";

/**
 * Storage service for Genesis Bus Booking App.
 * Uses Supabase as the database and synchronizes with localStorage for fast, synchronous reads.
 */

const STORAGE_KEY = "ETZ_BUS_BOOKINGS";

/**
 * Synchronizes bookings from the remote Supabase database to localStorage.
 * Should be called on application launch.
 */
export async function syncBookingsFromDb() {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*");

    if (error) throw error;

    if (data) {
      // Map DB columns to frontend keys
      const formatted = data.map((b) => ({
        id: b.id,
        busId: b.bus_id,
        busReg: b.bus_reg,
        busClass: b.bus_class,
        from: b.route_from,
        to: b.route_to,
        date: b.travel_date,
        departureTime: b.departure_time,
        seats: b.seats,
        passengers: b.passengers,
        subtotal: parseFloat(b.subtotal),
        tax: parseFloat(b.tax),
        serviceFee: parseFloat(b.service_fee),
        total: parseFloat(b.total),
        currency: b.currency,
        paymentMethod: b.payment_method,
        luggageInfo: b.luggage_info,
        paymentDetails: b.payment_details,
        timestamp: b.created_at,
        tenantId: "genesis", // Dedicated to Genesis
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
      return formatted;
    }
  } catch (e) {
    console.error("Failed to sync bookings from Supabase:", e.message);
  }
  return getAllBookings();
}

/**
 * Saves a new booking to Supabase and updates the localStorage cache.
 */
export async function saveBooking(booking) {
  const newBooking = {
    ...booking,
    id: `ETZ-${Math.floor(Math.random() * 900000) + 100000}`,
    timestamp: new Date().toISOString(),
  };

  // 1. Update localStorage cache immediately
  const bookings = getAllBookings();
  bookings.push(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));

  // 2. Persist to Supabase database
  try {
    const { error } = await supabase
      .from("bookings")
      .insert({
        id: newBooking.id,
        bus_id: newBooking.busId,
        bus_reg: newBooking.busReg || "GEN-01",
        bus_class: newBooking.busClass || "Luxury",
        route_from: newBooking.from,
        route_to: newBooking.to,
        travel_date: newBooking.date,
        departure_time: newBooking.departureTime || "08:00 AM",
        seats: newBooking.seats,
        passengers: newBooking.passengers,
        subtotal: newBooking.subtotal || newBooking.totalAmount || 0,
        tax: newBooking.tax || 0,
        service_fee: newBooking.serviceFee || 0,
        total: newBooking.totalAmount || newBooking.total || 0,
        currency: newBooking.currency,
        payment_method: newBooking.paymentMethod,
        luggage_info: newBooking.luggageInfo || { bags: 0, fee: 0 },
        payment_details: newBooking.paymentDetails || { status: "PAID", ref: "mock", gateway: "simulated" },
        created_at: newBooking.timestamp,
      });

    if (error) throw error;
  } catch (e) {
    console.error("Failed to save booking to Supabase database:", e.message);
  }

  return newBooking;
}

/**
 * Retrieves bookings (Genesis only)
 */
export function getBookings(tenantId) {
  // Returns all bookings from cache since it's now a single-tenant platform
  const all = getAllBookings();
  return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Retrieves all bookings from local cache
 */
export function getAllBookings() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse bookings from cache", e);
    return [];
  }
}

/**
 * Calculates the number of occupied seats for a specific bus on a date.
 */
export function getOccupancy(busId, date) {
  const bookings = getAllBookings();
  const filtered = bookings.filter((b) => {
    const bookingDate = new Date(b.timestamp).toDateString();
    const targetDate = new Date(date).toDateString();
    return b.busId === busId && bookingDate === targetDate;
  });

  return filtered.reduce((total, b) => total + b.seats.length, 0);
}

/**
 * Helper to clear local cache
 */
export function clearBookings() {
  localStorage.removeItem(STORAGE_KEY);
}
