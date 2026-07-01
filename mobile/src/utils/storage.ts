import { supabase } from "./supabaseClient";

export interface Booking {
  id: string;
  busId: string;
  busReg: string;
  busClass: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  seats: string[];
  passengers: Array<{ name: string; passport: string }>;
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
  currency: string;
  paymentMethod: string;
  luggageInfo?: any;
  paymentDetails?: any;
  timestamp: string;
}

/**
 * Saves a new booking directly to the Supabase Postgres database.
 */
export async function saveBooking(booking: Omit<Booking, "id" | "timestamp">): Promise<Booking> {
  const newBooking: Booking = {
    ...booking,
    id: `ETZ-${Math.floor(Math.random() * 900000) + 100000}`,
    timestamp: new Date().toISOString(),
  };

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
        departure_time: newBooking.departureTime,
        seats: newBooking.seats,
        passengers: newBooking.passengers,
        subtotal: newBooking.subtotal,
        tax: newBooking.tax,
        service_fee: newBooking.serviceFee,
        total: newBooking.total,
        currency: newBooking.currency,
        payment_method: newBooking.paymentMethod,
        luggage_info: newBooking.luggageInfo || { bags: 0, fee: 0 },
        payment_details: newBooking.paymentDetails || { status: "PAID", ref: "mock", gateway: "simulated" },
        created_at: newBooking.timestamp,
      });

    if (error) throw error;
  } catch (e: any) {
    console.error("Failed to save booking to Supabase:", e.message);
  }

  return newBooking;
}

/**
 * Fetches all bookings for the Genesis app from the Supabase database.
 */
export async function getBookings(): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data) {
      return data.map((b: any) => ({
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
      }));
    }
  } catch (e: any) {
    console.error("Failed to fetch bookings from Supabase:", e.message);
  }
  return [];
}

/**
 * Calculates the number of occupied seats for a specific bus on a travel date.
 */
export async function getOccupancy(busId: string, date: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("seats")
      .eq("bus_id", busId)
      .eq("travel_date", date);

    if (error) throw error;

    if (data) {
      return data.reduce((total: number, row: any) => total + (row.seats?.length || 0), 0);
    }
  } catch (e: any) {
    console.error("Failed to calculate occupancy from Supabase:", e.message);
  }
  return 0;
}
