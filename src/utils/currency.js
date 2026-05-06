// Multi-currency utility logic
const FX_RATES = {
  USD: 1,
  ZAR: parseFloat(import.meta.env.VITE_FX_ZAR) || 18.50,
  BWP: parseFloat(import.meta.env.VITE_FX_BWP) || 13.60,
};

export const CURRENCIES = [
  { id: "USD", symbol: "$", label: "US Dollar" },
  { id: "ZAR", symbol: "R", label: "SA Rand (ZAR)" },
  { id: "BWP", symbol: "P", label: "Botswana Pula" },
];

/**
 * Converts a base price (USD) to target currency
 */
export function convert(usdAmount, targetCurrency = "USD") {
  const rate = FX_RATES[targetCurrency] || 1;
  return usdAmount * rate;
}

/**
 * Formats a currency amount with symbol
 */
export function fmt(amount, currencyId = "USD") {
  const currency = CURRENCIES.find(c => c.id === currencyId) || CURRENCIES[0];
  return `${currency.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Converts and formats in one go
 */
export function fmtConverted(usdAmount, targetCurrency = "USD") {
  return fmt(convert(usdAmount, targetCurrency), targetCurrency);
}
