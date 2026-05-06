import { createContext, useContext } from "react";
import { TENANT_REGISTRY } from "./registry";

// Resolved at build time from VITE_TENANT_ID env variable
const tenantId = import.meta.env.VITE_TENANT_ID || "zupco";
const activeTenant = TENANT_REGISTRY[tenantId] || TENANT_REGISTRY["zupco"];

export const TenantContext = createContext(activeTenant);

export function TenantProvider({ children }) {
  return (
    <TenantContext.Provider value={activeTenant}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
