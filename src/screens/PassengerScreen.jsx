import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import BillBreakdown from "../components/BillBreakdown";

export default function PassengerScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const tenant = useTenant();

  const { seats = [], totalPrice = 0, busId } = state || {};

  const [passengers, setPassengers] = useState(
    seats.map(seat => ({ seatId: seat.id, name: "", idNumber: "" }))
  );

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    navigate("/payment", { state: { ...state, passengers } });
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#f8f9fa",
      paddingBottom: 40,
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
            <div style={{ fontSize: 18, fontWeight: "800" }}>Passenger Details</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Booking {seats.length} Tickets</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleContinue} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
        {passengers.map((p, i) => (
          <div key={p.seatId} style={{ 
            background: "#fff", 
            padding: 20, 
            borderRadius: 24, 
            boxShadow: "0 8px 24px rgba(0,0,0,0.04)" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: "800", color: tenant.primaryColor }}>PASSENGER {i + 1}</div>
              <div style={{ fontSize: 12, fontWeight: "700", color: "#64748b" }}>SEAT {p.seatId}</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, display: "block" }}>FULL NAME</label>
                <input 
                  required
                  value={p.name}
                  onChange={(e) => updatePassenger(i, "name", e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 15,
                    background: "#fcfcfc"
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, display: "block" }}>ID / PASSPORT NUMBER</label>
                <input 
                  required
                  value={p.idNumber}
                  onChange={(e) => updatePassenger(i, "idNumber", e.target.value)}
                  placeholder="e.g. 12-345678-X-90"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 15,
                    background: "#fcfcfc"
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <BillBreakdown subtotal={totalPrice} seatsCount={seats.length} />

        <button
          type="submit"
          style={{
            background: tenant.primaryColor,
            color: "#fff",
            border: "none",
            padding: "18px",
            borderRadius: 16,
            fontSize: 16,
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: `0 8px 20px ${tenant.primaryColor}44`,
            marginTop: 10
          }}
        >
          Proceed to Payment
        </button>
      </form>
    </div>
  );
}
