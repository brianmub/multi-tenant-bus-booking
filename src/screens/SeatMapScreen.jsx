import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { useCurrency } from "../hooks/useCurrency";
import { fmtConverted } from "../utils/currency";
import Nav from "../components/Nav";

export default function SeatMapScreen() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const tenant = useTenant();
  const { currency } = useCurrency();

  const [selectedSeats, setSelectedSeats] = useState([]);

  // Mock seat data - 10 rows, 2+2 layout
  const rows = Array.from({ length: 10 }, (_, i) => ({
    rowNum: i + 1,
    left: [
      { id: `${i+1}A`, status: Math.random() > 0.8 ? "booked" : "available" },
      { id: `${i+1}B`, status: Math.random() > 0.8 ? "booked" : "available" },
    ],
    right: [
      { id: `${i+1}C`, status: Math.random() > 0.8 ? "booked" : "available" },
      { id: `${i+1}D`, status: Math.random() > 0.8 ? "booked" : "available" },
    ]
  }));

  const toggleSeat = (seat) => {
    if (seat.status === "booked") return;
    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const totalPrice = selectedSeats.length * 15; // Mock price

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#f8f9fa",
      paddingBottom: 120,
    }}>
      {/* Header */}
      <div style={{
        background: tenant.bgGradient,
        padding: "24px 24px 40px",
        borderRadius: "0 0 32px 32px",
        color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              background: "rgba(255,255,255,0.2)", 
              border: "none", 
              width: 40, 
              height: 40, 
              borderRadius: "50%", 
              color: "#fff",
              fontSize: 20,
              cursor: "pointer"
            }}
          >
            ←
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: "800" }}>Select Seats</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Bus #{busId} • Executive Class</div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: "600" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#fff" }} /> Available
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: "600" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: tenant.primaryColor }} /> Selected
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: "600" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(255,255,255,0.3)" }} /> Booked
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div style={{ padding: "30px 24px" }}>
        <div style={{ 
          background: "#fff", 
          borderRadius: 30, 
          padding: "40px 20px", 
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          {/* Steering Wheel Placeholder */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 8 }}>
               <div style={{ background: "#fef9c3", border: "1px solid #fde047", padding: "4px 8px", borderRadius: 8, fontSize: 10, fontWeight: "800", color: "#854d0e" }}>✨ AI RECOMENDED</div>
            </div>
            <div style={{ fontSize: 24 }}>🎡</div>
          </div>

          {rows.map((row) => (
            <div key={row.rowNum} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 10 }}>
                {row.left.map(seat => {
                  const isSelected = selectedSeats.find(s => s.id === seat.id);
                  const isRecommended = seat.id === "1A" || seat.id === "1B"; // Mock recommendation
                  const isQuiet = seat.id === "10A" || seat.id === "10B"; // Mock quiet zone
                  
                  return (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.status === "booked"}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        border: "none",
                        background: seat.status === "booked" ? "#f1f5f9" : isSelected ? tenant.primaryColor : isRecommended ? "#fef9c3" : isQuiet ? "#f0f9ff" : "#fff",
                        color: isSelected ? "#fff" : seat.status === "booked" ? "#cbd5e1" : (isRecommended || isQuiet) ? "#1e293b" : "#64748b",
                        fontSize: 10,
                        fontWeight: "800",
                        cursor: seat.status === "booked" ? "not-allowed" : "pointer",
                        boxShadow: isSelected ? `0 4px 12px ${tenant.primaryColor}66` : "0 2px 6px rgba(0,0,0,0.05)",
                        border: isSelected ? "none" : (isRecommended ? "1px solid #fde047" : isQuiet ? "1px solid #bae6fd" : "1px solid #e2e8f0"),
                        position: "relative"
                      }}
                    >
                      {seat.id}
                      {isRecommended && !isSelected && <span style={{ position: "absolute", top: -8, right: -8, fontSize: 12 }}>⭐</span>}
                      {isQuiet && !isSelected && <span style={{ position: "absolute", top: -8, right: -8, fontSize: 12 }}>🌙</span>}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: 10, color: "#cbd5e1", fontWeight: "700" }}>{row.rowNum}</div>

              <div style={{ display: "flex", gap: 10 }}>
                {row.right.map(seat => {
                  const isSelected = selectedSeats.find(s => s.id === seat.id);
                  const isRecommended = seat.id === "2C"; // Mock recommendation
                  
                  return (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.status === "booked"}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        border: "none",
                        background: seat.status === "booked" ? "#f1f5f9" : isSelected ? tenant.primaryColor : isRecommended ? "#fef9c3" : "#fff",
                        color: isSelected ? "#fff" : seat.status === "booked" ? "#cbd5e1" : isRecommended ? "#1e293b" : "#64748b",
                        fontSize: 10,
                        fontWeight: "800",
                        cursor: seat.status === "booked" ? "not-allowed" : "pointer",
                        boxShadow: isSelected ? `0 4px 12px ${tenant.primaryColor}66` : "0 2px 6px rgba(0,0,0,0.05)",
                        border: isSelected ? "none" : (isRecommended ? "1px solid #fde047" : "1px solid #e2e8f0"),
                        position: "relative"
                      }}
                    >
                      {seat.id}
                      {isRecommended && !isSelected && <span style={{ position: "absolute", top: -8, right: -8, fontSize: 12 }}>⭐</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      {selectedSeats.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          padding: "20px 24px calc(20px + env(safe-area-inset-bottom))",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 101,
          borderRadius: "32px 32px 0 0"
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#666", fontWeight: "600" }}>{selectedSeats.length} Seats Selected</div>
            <div style={{ fontSize: 20, fontWeight: "900", color: tenant.primaryColor }}>
              {fmtConverted(totalPrice, currency.id)}
            </div>
          </div>
          <button
            onClick={() => navigate("/passenger", { state: { seats: selectedSeats, totalPrice, busId } })}
            style={{
              background: tenant.primaryColor,
              color: "#fff",
              border: "none",
              padding: "14px 32px",
              borderRadius: 16,
              fontSize: 16,
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: `0 8px 20px ${tenant.primaryColor}44`
            }}
          >
            Confirm
          </button>
        </div>
      )}

      {!selectedSeats.length && <Nav />}
    </div>
  );
}
