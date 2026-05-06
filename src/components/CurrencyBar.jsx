import { useCurrency } from "../hooks/useCurrency";
import { CURRENCIES } from "../utils/currency";
import { useTenant } from "../tenants/useTenant";

export default function CurrencyBar() {
  const { currency, setCurrency } = useCurrency();
  const tenant = useTenant();

  return (
    <div style={{
      display: "flex",
      background: "rgba(255,255,255,0.1)",
      padding: 4,
      borderRadius: 12,
      backdropFilter: "blur(4px)",
    }}>
      {CURRENCIES.map((curr) => {
        const isActive = currency.id === curr.id;
        return (
          <button
            key={curr.id}
            onClick={() => setCurrency(curr.id)}
            style={{
              flex: 1,
              padding: "6px 12px",
              border: "none",
              background: isActive ? "#fff" : "transparent",
              color: isActive ? tenant.primaryColor : "#fff",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: "700",
              cursor: "pointer",
              transition: "0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {curr.id}
          </button>
        );
      })}
    </div>
  );
}
