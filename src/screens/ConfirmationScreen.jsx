import { useLocation, useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { useCurrency } from "../hooks/useCurrency";
import TicketQR from "../components/TicketQR";

export default function ConfirmationScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const tenant = useTenant();
  const { currency } = useCurrency();

  const { totalAmount, passengers = [], busId, timestamp, id, from, to } = state || {};

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
      padding: "60px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center"
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
        marginBottom: 24,
        animation: "successBounce 1s ease"
      }}>
        ✅
      </div>

      <h1 className="no-print" style={{ fontSize: 24, fontWeight: "900", color: "#1e293b", margin: "0 0 8px" }}>Payment Successful!</h1>
      <p className="no-print" style={{ fontSize: 15, color: "#64748b", margin: "0 0 32px" }}>Your e-ticket has been generated and saved to your profile.</p>

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
        <div style={{ background: tenant.primaryColor, padding: 20, color: "#fff", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: "800", opacity: 0.8, textTransform: "uppercase" }}>E-TICKET REFERENCE</div>
              <div style={{ fontSize: 18, fontWeight: "900" }}>#{id}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900" }}>{tenant.logo}</div>
          </div>
        </div>

        <div style={{ padding: 24, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: "800", color: "#94a3b8" }}>OPERATOR</div>
              <div style={{ fontSize: 14, fontWeight: "700", color: "#1e293b" }}>{tenant.name}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: "800", color: "#94a3b8" }}>DATE</div>
              <div style={{ fontSize: 14, fontWeight: "700", color: "#1e293b" }}>{new Date(timestamp).toLocaleDateString()}</div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
             <div style={{ fontSize: 10, fontWeight: "800", color: "#94a3b8" }}>ROUTE</div>
             <div style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>{from} → {to}</div>
          </div>

          <div style={{ borderTop: "1px dashed #e2e8f0", padding: "16px 0", marginBottom: 16 }}>
             {passengers.map((p, i) => (
               <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                 <span style={{ fontSize: 13, color: "#334155" }}>{p.name}</span>
                 <span style={{ fontSize: 13, fontWeight: "700", color: tenant.primaryColor }}>Seat {p.seatId}</span>
               </div>
             ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0", background: "#f8fafc", borderRadius: 16, marginBottom: 16 }}>
             <TicketQR value={id} size={140} />
          </div>

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
                <div style={{ fontSize: 16, fontWeight: "900", color: "#0c4a6e" }}>~4h 15m</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: "700", color: "#0369a1", opacity: 0.7 }}>CONFIDENCE</div>
                <div style={{ fontSize: 14, fontWeight: "900", color: "#0c4a6e" }}>94%</div>
              </div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#0369a1", fontWeight: "600", fontStyle: "italic" }}>
              "Light traffic predicted for this route. Journey expected to be on time."
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 10, color: "#94a3b8", fontWeight: "700" }}>PRESENT THIS QR CODE FOR BOARDING</div>
        </div>

        {/* Ticket Cuts */}
        <div className="no-print" style={{ position: "absolute", left: -10, top: 60, width: 20, height: 20, borderRadius: "50%", background: "#f8f9fa" }} />
        <div className="no-print" style={{ position: "absolute", right: -10, top: 60, width: 20, height: 20, borderRadius: "50%", background: "#f8f9fa" }} />
      </div>

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
