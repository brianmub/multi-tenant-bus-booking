import { createContext, useContext, useState } from "react";
import { CURRENCIES } from "../utils/currency";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(CURRENCIES[0]); // Default to USD

  const changeCurrency = (id) => {
    const found = CURRENCIES.find(c => c.id === id);
    if (found) setCurrency(found);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: changeCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
