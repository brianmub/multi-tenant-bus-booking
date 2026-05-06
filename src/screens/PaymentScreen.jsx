import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { useCurrency } from "../hooks/useCurrency";
import { fmtConverted } from "../utils/currency";
import { saveBooking } from "../utils/storage";

export default function PaymentScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const tenant = useTenant();
  const { currency } = useCurrency();

  const { totalPrice = 0, seats = [], passengers = [], busId, from, to } = state || {};
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const tax = totalPrice * 0.15;
  const serviceFee = 2.00;
  const totalAmount = totalPrice + tax + serviceFee;

  const handlePay = () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      const bookingData = {
        tenantId: tenant.id,
        busId,
        from,
        to,
        seats: seats.map(s => s.id),
        passengers,
        totalAmount,
        currency: currency.id,
        paymentMethod: selectedMethod,
      };

      const savedBooking = saveBooking(bookingData);
      
      setIsProcessing(false);
      navigate("/confirmation", { state: { ...savedBooking } });
    }, 2000);
  };

  const methods = [
    { id: "ozow", name: "Ozow (Instant EFT)", icon: "⚡", color: "#00b2e3" },
    { id: "snapscan", name: "SnapScan", icon: "📸", color: "#f7941d" },
    { id: "paystack", name: "Paystack (Card/EFT)", icon: "💳", color: "#011b33" },
    { id: "card", name: "Bank Card", icon: "🏦", color: "#3b82f6" },
  ].filter(m => tenant.paymentMethods.includes(m.id));

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
            <div style={{ fontSize: 18, fontWeight: "800" }}>Payment</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Choose your preferred method</div>
          </div>
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{
          background: "#fff",
          padding: 30,
          borderRadius: 24,
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: "700", textTransform: "uppercase", marginBottom: 8 }}>Payable Amount</div>
          <div style={{ fontSize: 32, fontWeight: "900", color: "#1e293b" }}>{fmtConverted(totalAmount, currency.id)}</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>For {seats.length} tickets</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: "800", color: "#1e293b", marginBottom: 4 }}>SELECT PAYMENT METHOD</label>
          {methods.map(m => (
            <div 
              key={m.id}
              onClick={() => setSelectedMethod(m.id)}
              style={{
                background: "#fff",
                padding: 18,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                border: `2px solid ${selectedMethod === m.id ? tenant.primaryColor : "#eee"}`,
                transition: "0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <span style={{ fontSize: 16, fontWeight: "700", color: "#334155" }}>{m.name}</span>
              </div>
              <div style={{ 
                width: 20, 
                height: 20, 
                borderRadius: "50%", 
                border: `2px solid ${selectedMethod === m.id ? tenant.primaryColor : "#cbd5e1"}`,
                background: selectedMethod === m.id ? tenant.primaryColor : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {selectedMethod === m.id && <div style={{ width: 8, height: 8, background: "#fff", borderRadius: "50%" }} />}
              </div>
            </div>
          ))}
        </div>

        {selectedMethod === "ozow" && (
          <div style={{ background: "#f0f9ff", padding: 16, borderRadius: 16, border: "1px solid #bae6fd", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: "700", color: "#0369a1", marginBottom: 8 }}>SECURE INSTANT EFT</div>
            <div style={{ fontSize: 11, color: "#0c4a6e" }}>You will be redirected to Ozow to log into your bank and authorize payment.</div>
          </div>
        )}

        {selectedMethod === "snapscan" && (
          <div style={{ background: "#fff7ed", padding: 16, borderRadius: 16, border: "1px solid #ffedd5", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: "700", color: "#c2410c", marginBottom: 8 }}>SCAN TO PAY</div>
            <div style={{ margin: "10px auto", width: 80, height: 80, background: "#333", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 40 }}>📱</div>
            <div style={{ fontSize: 11, color: "#7c2d12" }}>Open SnapScan on your phone to scan and pay.</div>
          </div>
        )}

        <button
          disabled={!selectedMethod || isProcessing}
          onClick={handlePay}
          style={{
            background: isProcessing ? "#cbd5e1" : tenant.primaryColor,
            color: "#fff",
            border: "none",
            padding: "18px",
            borderRadius: 16,
            fontSize: 16,
            fontWeight: "700",
            cursor: isProcessing ? "not-allowed" : "pointer",
            boxShadow: isProcessing ? "none" : `0 8px 20px ${tenant.primaryColor}44`,
            marginTop: 10
          }}
        >
          {isProcessing ? "Processing..." : `Pay ${fmtConverted(totalAmount, currency.id)}`}
        </button>
      </div>
    </div>
  );
}
