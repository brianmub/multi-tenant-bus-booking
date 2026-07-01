/**
 * Fleet Registry for the Genesis Bus Booking App.
 * Defines the physical bus assets for Genesis Bus Company.
 */

export const FLEET_REGISTRY = {
  genesis: [
    { id: "G-401", reg: "GEN 001 ZW", model: "Scania Marcopolo G8", capacity: 40, status: "active", class: "Luxury VIP", driver_name: "Tendai Maposa", driver_phone: "+263 772 123 456", operator_hotline: "+263 8677 000 000" },
    { id: "G-402", reg: "GEN 002 ZW", model: "Scania Marcopolo G8", capacity: 40, status: "active", class: "Luxury VIP", driver_name: "Sipho Ndlovu", driver_phone: "+263 712 987 654", operator_hotline: "+263 8677 000 000" },
    { id: "G-403", reg: "GEN 003 ZW", model: "Volvo B11R", capacity: 50, status: "active", class: "Executive", driver_name: "Michael Chigora", driver_phone: "+263 773 111 222", operator_hotline: "+263 8677 000 000" },
    { id: "G-404", reg: "GEN 004 ZW", model: "Volvo B11R", capacity: 50, status: "maintenance", class: "Executive", driver_name: "Tinashe Dube", driver_phone: "+263 714 555 666", operator_hotline: "+263 8677 000 000" },
  ]
};

/**
 * Gets the fleet (defaults to Genesis)
 */
export function getFleet(tenantId) {
  return FLEET_REGISTRY.genesis;
}

/**
 * Gets specific bus details
 */
export function getBusDetails(busId) {
  const allBuses = Object.values(FLEET_REGISTRY).flat();
  return allBuses.find(b => b.id === busId);
}
