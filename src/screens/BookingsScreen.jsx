import { useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import Nav from "../components/Nav";
import { getBookings } from "../utils/storage";

export default function BookingsScreen() {
  const navigate = useNavigate();
  const tenant = useTenant();

  const bookings = getBookings(tenant.id);

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#f8f9fa",
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{
        background: tenant.bgGradient,
        padding: "40px 24px",
        borderRadius: "0 0 32px 32px",
        color: "#fff",
      }}>
        <h1 style={{ fontSize: 24, fontWeight: "900", margin: 0 }}>My Tickets</h1>
        <p style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>Manage your active and past bookings</p>
      </div>

      <div style={{ padding: 24 }}>
        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
             <div style={{ fontSize: 48, marginBottom: 16 }}>🎟️</div>
             <div style={{ fontSize: 16, fontWeight: "700", color: "#1e293b" }}>No active bookings</div>
             <p style={{ fontSize: 14, color: "#64748b", marginTop: 8 }}>Ready for your next adventure?</p>
             <button 
               onClick={() => navigate("/home")}
               style={{
                 marginTop: 20,
                 background: tenant.primaryColor,
                 color: "#fff",
                 border: "none",
                 padding: "12px 24px",
                 borderRadius: 12,
                 fontWeight: "700"
               }}
             >
               Book a Bus
             </button>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking.id} style={{
              background: "#fff",
              borderRadius: 24,
              padding: 20,
              marginBottom: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              border: "1px solid #eee"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: "800", color: "#94a3b8" }}>#{booking.id}</div>
                <div style={{ 
                  fontSize: 10, 
                  fontWeight: "800", 
                  color: "#16a34a", 
                  background: "#dcfce7", 
                  padding: "4px 8px", 
                  borderRadius: 6 
                }}>CONFIRMED</div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: "800", color: "#1e293b" }}>{booking.from} → {booking.to}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{new Date(booking.timestamp).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                   <div style={{ fontSize: 12, color: "#94a3b8" }}>Seats</div>
                   <div style={{ fontSize: 14, fontWeight: "700", color: tenant.primaryColor }}>{booking.seats.join(", ")}</div>
                </div>
              </div>

              <button 
                onClick={() => navigate("/confirmation", { state: booking })}
                style={{
                  width: "100%",
                  marginTop: 20,
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  padding: "10px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                View Ticket & QR
              </button>
            </div>
          ))
        )}
      </div>

      <Nav />
    </div>
  );
}
