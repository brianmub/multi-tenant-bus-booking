import { useTenant } from "../tenants/useTenant";
import { useCurrency } from "../hooks/useCurrency";
import { fmtConverted } from "../utils/currency";
import { getCutoffStatus } from "../utils/cutoff";
import CutoffBadge from "./CutoffBadge";
import { useLanguage } from "../context/LanguageContext";

export default function BusCard({ bus, onClick, cutoffConfig }) {
  const tenant = useTenant();
  const { currency } = useCurrency();
  const { t } = useLanguage();
  
  const displayCurrency = currency.id;
  const statusInfo = getCutoffStatus(bus.time, cutoffConfig);
  const isClosed = statusInfo.status === "CLOSED";

  return (
    <div
      onClick={() => !isClosed && onClick()}
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        cursor: isClosed ? "not-allowed" : "pointer",
        transition: "transform 0.2s",
        border: "1px solid #f0f0f0",
        opacity: isClosed ? 0.7 : 1,
        position: "relative"
      }}
      onMouseOver={(e) => !isClosed && (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseOut={(e) => !isClosed && (e.currentTarget.style.transform = "scale(1.0)")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: "700", color: "#1a1a1a" }}>{bus.time}</div>
            <CutoffBadge statusInfo={statusInfo} />
          </div>
          <div style={{ fontSize: 13, color: "#666" }}>{bus.routeName}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: "800", color: tenant.primaryColor }}>
            {fmtConverted(bus.price, displayCurrency)}
          </div>
          <div style={{ fontSize: 11, color: "#999", fontWeight: "600" }}>PER SEAT</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: "1px dashed #eee" }}>
        <div style={{ 
          fontSize: 12, 
          fontWeight: "600", 
          padding: "4px 10px", 
          borderRadius: 8, 
          background: "#f8f9fa", 
          color: "#444" 
        }}>
          🚌 {bus.busNumber}
        </div>
        {bus.availableSeats <= 15 ? (
          <div style={{ 
            fontSize: 12, 
            fontWeight: "800", 
            padding: "4px 10px", 
            borderRadius: 8, 
            background: "#fef2f2", 
            color: "#ef4444",
            border: "1px solid #fecaca"
          }}>
            {t("seats_left", { count: bus.availableSeats })}
          </div>
        ) : (
          <div style={{ 
            fontSize: 12, 
            fontWeight: "600", 
            padding: "4px 10px", 
            borderRadius: 8, 
            background: "#f8f9fa", 
            color: "#444" 
          }}>
            💺 {bus.availableSeats} {t("available")}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: 8, fontSize: 12, color: "#888", display: "flex", justifyContent: "space-between" }}>
        <span>Class: {bus.class || "Standard"}</span>
        <span style={{ color: isClosed ? "#ef4444" : tenant.primaryColor, fontWeight: "700" }}>
          {isClosed ? "BOOKING CLOSED" : t("select_seats") + " →"}
        </span>
      </div>
    </div>
  );
}
