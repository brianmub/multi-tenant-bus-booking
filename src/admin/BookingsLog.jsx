import { useState, useEffect } from "react";
import { getAllBookings } from "../utils/storage";
import { TENANT_REGISTRY } from "../tenants/registry";

export default function BookingsLog() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setBookings(getAllBookings().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  }, []);

  const filteredBookings = filter === "all" 
    ? bookings 
    : bookings.filter(b => b.tenantId === filter);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <header style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            Bookings Log
          </h1>
          <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: 15 }}>
            View and manage all tickets issued across the platform.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
           <select 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             style={{
               padding: "10px 16px",
               borderRadius: 12,
               border: "1px solid #e2e8f0",
               fontSize: 14,
               fontWeight: "600",
               background: "#fff",
               cursor: "pointer"
             }}
           >
             <option value="all">All Operators</option>
             {Object.values(TENANT_REGISTRY).map(t => (
               <option key={t.id} value={t.id}>{t.name}</option>
             ))}
           </select>
        </div>
      </header>

      <div style={{
        background: "#fff",
        borderRadius: 24,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>REF #</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>OPERATOR</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>ROUTE</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>PASSENGER</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>AMOUNT</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>DATE</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                  No bookings found.
                </td>
              </tr>
            ) : (
              filteredBookings.map(b => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: "700", color: "#1e293b" }}>{b.id}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: 6, 
                        background: TENANT_REGISTRY[b.tenantId]?.primaryColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        color: "#fff",
                        fontWeight: "900"
                      }}>{TENANT_REGISTRY[b.tenantId]?.logo}</div>
                      <span style={{ fontSize: 13, fontWeight: "600" }}>{TENANT_REGISTRY[b.tenantId]?.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: 13, color: "#334155" }}>
                    {b.from} → {b.to}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontSize: 13, fontWeight: "600" }}>{b.passengers[0]?.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>+{b.passengers.length - 1} more</div>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: "700", color: "#0f172a" }}>
                    {b.currency} {b.totalAmount.toFixed(2)}
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: 13, color: "#64748b" }}>
                    {new Date(b.timestamp).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: "800", 
                      padding: "4px 10px", 
                      borderRadius: 100, 
                      background: "#dcfce7", 
                      color: "#16a34a" 
                    }}>PAID</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
