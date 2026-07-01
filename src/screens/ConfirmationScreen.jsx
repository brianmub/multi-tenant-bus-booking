import { useLocation, useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { useCurrency } from "../hooks/useCurrency";
import TicketQR from "../components/TicketQR";
import BorderChecklist from "../components/BorderChecklist";
import { getBusDetails } from "../utils/fleet";

export default function ConfirmationScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const tenant = useTenant();
  const { currency } = useCurrency();

  const { 
    totalAmount = 0, 
    passengers = [], 
    busId, 
    timestamp = new Date().toISOString(), 
    id = "GEN-TXN-01", 
    from = "Harare", 
    to = "Bulawayo",
    luggageInfo = { bags: 0, fee: 0 }
  } = state || {};

  const bus = getBusDetails(busId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#f8f9fa",
      padding: "40px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="no-print" style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "#dcfce7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 40,
        marginBottom: 20,
        animation: "successBounce 1s ease"
      }}>
        ✅
      </div>

      <h1 className="no-print" style={{ fontSize: 24, fontWeight: "900", color: "#1e293b", margin: "0 0 8px" }}>Payment Successful!</h1>
      <p className="no-print" style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px" }}>Your e-ticket has been generated and saved to your profile history.</p>

      {/* Ticket Dispatched Notification Banner */}
      <div className="no-print" style={{
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: 20,
        padding: "14px 20px",
        marginBottom: 24,
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        textAlign: "left"
      }}>
        <span style={{ fontSize: 24 }}>💬</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: "800", color: "#166534" }}>TICKET DISPATCHED</div>
          <div style={{ fontSize: 11, color: "#15803d", marginTop: 2 }}>
            Simulated ticket details sent to WhatsApp at <strong>+263 77 123 4567</strong> and passenger email accounts.
          </div>
        </div>
      </div>

      {/* Ticket Preview */}
      <div id="printable-ticket" style={{
        width: "100%",
        background: "#fff",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
        position: "relative",
        border: "1px solid #e2e8f0"
      }}>
        <div style={{ background: tenant.bgGradient, padding: 20, color: "#fff", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: "800", opacity: 0.8, textTransform: "uppercase" }}>E-TICKET REFERENCE</div>
              <div style={{ fontSize: 18, fontWeight: "900", color: "#fff" }}>#{id}</div>
            </div>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: tenant.primaryColor,
              color: "#121212",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "900",
              fontSize: 16
            }}>
              G
            </div>
          </div>
        </div>

        <div style={{ padding: 24, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: "800", color: "#94a3b8" }}>OPERATOR</div>
              <div style={{ fontSize: 14, fontWeight: "700", color: "#1e293b" }}>{tenant.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: "800", color: "#94a3b8" }}>BOOKED ON</div>
              <div style={{ fontSize: 14, fontWeight: "700", color: "#1e293b" }}>{new Date(timestamp).toLocaleDateString()}</div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
             <div style={{ fontSize: 10, fontWeight: "800", color: "#94a3b8" }}>ROUTE</div>
             <div style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>{from} → {to}</div>
          </div>

          {/* Passenger Boarding list */}
          <div style={{ borderTop: "1px dashed #e2e8f0", padding: "16px 0", marginBottom: 12 }}>
             <div style={{ fontSize: 10, fontWeight: "800", color: "#94a3b8", marginBottom: 10 }}>PASSENGER LIST</div>
             {passengers.map((p, i) => (
               <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                 <span style={{ color: "#334155", fontWeight: "600" }}>{p.name} ({p.nationality || "ZW"})</span>
                 <span style={{ fontWeight: "800", color: tenant.primaryColor }}>Seat {p.seatId}</span>
               </div>
             ))}
          </div>

          {/* Luggage Details */}
          {luggageInfo && luggageInfo.bags > 0 && (
            <div style={{ borderTop: "1px dashed #e2e8f0", padding: "12px 0", fontSize: 12, color: "#475569" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Checked Luggage:</span>
                <span style={{ fontWeight: "700", color: "#1e293b" }}>{luggageInfo.bags} Extra Bag(s)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span>Excess Baggage Fee:</span>
                <span style={{ fontWeight: "700", color: "#1e293b" }}>${luggageInfo.fee.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* QR Barcode */}
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0", background: "#f8fafc", borderRadius: 16, marginBottom: 16 }}>
             <TicketQR value={id} size={140} />
          </div>

          {/* AI Insights block */}
          <div style={{ 
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", 
            borderRadius: 16, 
            padding: 16, 
            border: "1px solid #bae6fd",
            marginBottom: 12
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <span style={{ fontSize: 12, fontWeight: "900", color: "#0369a1", textTransform: "uppercase" }}>AI Journey Insights</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: "700", color: "#0369a1", opacity: 0.7 }}>PREDICTED ETA</div>
                <div style={{ fontSize: 16, fontWeight: "900", color: "#0c4a6e" }}>~5h 45m</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: "700", color: "#0369a1", opacity: 0.7 }}>CONFIDENCE</div>
                <div style={{ fontSize: 14, fontWeight: "900", color: "#0c4a6e" }}>96%</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#0369a1", fontWeight: "600", fontStyle: "italic" }}>
              "Cross-border check-point Beit Bridge running smoothly today. Average delays under 15 mins."
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", fontWeight: "700" }}>
            PRESENT THIS QR CODE AT BOARDING GATE
          </div>
        </div>

        {/* Ticket Side Cuts */}
        <div className="no-print" style={{ position: "absolute", left: -10, top: 68, width: 20, height: 20, borderRadius: "50%", background: "#f8f9fa" }} />
        <div className="no-print" style={{ position: "absolute", right: -10, top: 68, width: 20, height: 20, borderRadius: "50%", background: "#f8f9fa" }} />
      </div>

      {/* Button Controls */}
      <div className="no-print" style={{ width: "100%", marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={handlePrint}
          style={{
            width: "100%",
            background: "#1e293b",
            color: "#fff",
            border: "none",
            padding: "16px",
            borderRadius: 16,
            fontSize: 15,
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          📥 Download PDF Ticket
        </button>

        <button
          onClick={() => navigate(`/track/${id}`)}
          style={{
            width: "100%",
            background: "#ecfdf5",
            color: "#059669",
            border: "1px solid #10b981",
            padding: "16px",
            borderRadius: 16,
            fontSize: 15,
            fontWeight: "800",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          📍 Track Live Journey
        </button>

        <button
          onClick={() => navigate("/home")}
          style={{
            width: "100%",
            background: "transparent",
            color: "#64748b",
            border: "2px solid #e2e8f0",
            padding: "16px",
            borderRadius: 16,
            fontSize: 15,
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          Return Home
        </button>
      </div>

      {/* Crew Transparency Details */}
      {bus && bus.driver_name && (
        <div className="no-print" style={{ width: "100%", marginTop: 24, background: "#fff", padding: 20, borderRadius: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: "800", color: "#1e293b" }}>Crew & Vehicle Details</div>
            <div style={{ fontSize: 18 }}>🚌</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#64748b", fontWeight: "600" }}>Driver Name</span>
              <span style={{ color: "#1e293b", fontWeight: "700" }}>{bus.driver_name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#64748b", fontWeight: "600" }}>Bus Registration</span>
              <span style={{ color: "#1e293b", fontWeight: "700" }}>{bus.reg}</span>
            </div>
            <a href={`tel:${bus.operator_hotline}`} style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              marginTop: 8,
              padding: "10px",
              background: `${tenant.primaryColor}15`,
              color: tenant.primaryColor,
              borderRadius: 12,
              fontSize: 13,
              fontWeight: "800",
              textDecoration: "none"
            }}>
              📞 Call Operator Hotline
            </a>
          </div>
        </div>
      )}

      {/* Border Checklist */}
      <div className="no-print" style={{ width: "100%", paddingBottom: 40 }}>
        <BorderChecklist />
      </div>

      <style>{`
        @keyframes successBounce {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          #printable-ticket { 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            position: absolute;
            top: 0;
            left: 0;
          }
          @page { margin: 0; }
        }
      `}</style>
    </div>
  );
}
