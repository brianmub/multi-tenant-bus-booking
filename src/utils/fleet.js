/**
 * Fleet Registry for the Multi-tenant Bus Platform.
 * Defines the physical bus assets for each operator.
 */

export const FLEET_REGISTRY = {
  zupco: [
    { id: "Z-101", reg: "B 201 AA", model: "Yutong ZK6122H", capacity: 62, status: "active", class: "Standard" },
    { id: "Z-102", reg: "B 202 AA", model: "Yutong ZK6122H", capacity: 62, status: "active", class: "Standard" },
    { id: "Z-103", reg: "B 203 AA", model: "Golden Dragon", capacity: 65, status: "maintenance", class: "Economy" },
    { id: "Z-104", reg: "B 204 AA", model: "Yutong ZK6122H", capacity: 62, status: "active", class: "Standard" },
  ],
  swift: [
    { id: "S-201", reg: "JHB 405 GP", model: "Scania Marcopolo G7", capacity: 52, status: "active", class: "Executive" },
    { id: "S-202", reg: "JHB 406 GP", model: "Scania Marcopolo G7", capacity: 52, status: "active", class: "Executive" },
    { id: "S-203", reg: "JHB 407 GP", model: "Mercedes-Benz Paradiso", capacity: 48, status: "active", class: "VIP" },
    { id: "S-204", reg: "JHB 408 GP", model: "Scania Marcopolo G7", capacity: 52, status: "maintenance", class: "Executive" },
  ],
  horizon: [
    { id: "H-301", reg: "B 777 BW", model: "Volvo B11R", capacity: 56, status: "active", class: "Luxury" },
    { id: "H-302", reg: "B 778 BW", model: "Volvo B11R", capacity: 56, status: "active", class: "Luxury" },
    { id: "H-303", reg: "B 779 BW", model: "MAN Lion's Coach", capacity: 50, status: "active", class: "Executive" },
  ]
};

/**
 * Gets the fleet for a specific tenant
 */
export function getFleet(tenantId) {
  return FLEET_REGISTRY[tenantId] || [];
}

/**
 * Gets specific bus details
 */
export function getBusDetails(busId) {
  const allBuses = Object.values(FLEET_REGISTRY).flat();
  return allBuses.find(b => b.id === busId);
}
