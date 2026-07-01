import { createContext, useContext } from "react";
import { GENESIS_CONFIG } from "./registry";

export const TenantContext = createContext(GENESIS_CONFIG);

export function TenantProvider({ children }) {
  return (
    <TenantContext.Provider value={GENESIS_CONFIG}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
