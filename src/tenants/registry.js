export const TENANT_REGISTRY = {
  genesis: {
    id: "genesis",
    name: "Genesis Bus Company",
    tagline: "Safe and Reliable Journeys",
    primaryColor: "#d4af37",        // Gold
    primaryDark: "#121212",         // Black
    bgGradient: "linear-gradient(135deg, #121212 0%, #1e1e1e 50%, #d4af37 100%)",
    logo: "G",
    logoShape: "circle",
    baseCurrency: "USD",
    acceptedCurrencies: ["USD", "ZAR"],
    supportPhone: "+263 77 123 4567",
    supportEmail: "info@genesisbus.co.zw",
    website: "genesisbus.co.zw",
    routes: [
      "Harare ↔ Bulawayo",
      "Harare ↔ Mutare",
      "Bulawayo ↔ Beit Bridge",
      "Johannesburg ↔ Bulawayo",
    ],
    bookingCutoffMins: 60,
    cutoffReference: "departure",
    checkinOffsetMins: 30,
    paymentMethods: ["card", "paystack"],
    cities: [
      "Harare", "Bulawayo", "Mutare", "Gweru", "Beit Bridge",
      "Johannesburg", "Pretoria", "Polokwane", "Musina", "Gwanda"
    ],
  },
};
export const GENESIS_CONFIG = TENANT_REGISTRY.genesis;
