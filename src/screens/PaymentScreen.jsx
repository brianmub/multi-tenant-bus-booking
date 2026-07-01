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

  const { 
    totalPrice = 0, 
    seats = [], 
    passengers = [], 
    busId, 
    from, 
    to, 
    date,
    luggageInfo = { bags: 0, fee: 0 },
    totalPriceWithLuggage = 0
  } = state || {};

  const [selectedMethod, setSelectedMethod] = useState("");
  const [paymentPortal, setPaymentPortal] = useState(null); // 'paystack' | 'ozow' | null
  const [portalStep, setPortalStep] = useState("form"); // 'form' | 'loading' | 'otp' | 'submitting'
  
  // Card input states (Paystack)
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  
  // Bank selection states (Ozow)
  const [selectedBank, setSelectedBank] = useState("");
  const [bankUser, setBankUser] = useState("");
  const [bankPin, setBankPin] = useState("");

  // OTP Verification Code
  const [otpCode, setOtpCode] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const tax = totalPrice * 0.15;
  const serviceFee = 2.0;
  // If price with luggage exists, use it, else calculate default
  const totalAmount = totalPriceWithLuggage > 0 
    ? totalPriceWithLuggage + tax + serviceFee 
    : totalPrice + tax + serviceFee;

  const handlePaySelection = () => {
    if (!selectedMethod) return;
    setPaymentError("");
    
    if (selectedMethod === "paystack" || selectedMethod === "card") {
      setPaymentPortal("paystack");
      setPortalStep("form");
    } else if (selectedMethod === "ozow") {
      setPaymentPortal("ozow");
      setPortalStep("form");
    } else {
      // Direct checkout for snapscan
      processSimulatedDirect();
    }
  };

  const processSimulatedDirect = async () => {
    setPortalStep("submitting");
    const txnRef = `snap_ref_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const bookingData = {
      tenantId: tenant.id,
      busId,
      from,
      to,
      date,
      seats: seats.map((s) => s.id),
      passengers,
      subtotal: totalPrice,
      tax,
      serviceFee,
      totalAmount,
      currency: currency.id,
      paymentMethod: selectedMethod,
      luggageInfo,
      paymentDetails: {
        status: "PAID",
        ref: txnRef,
        gateway: selectedMethod,
      }
    };

    const savedBooking = await saveBooking(bookingData);
    navigate("/confirmation", { state: { ...savedBooking } });
  };

  const handleCardSubmit = (e) => {
    e.preventDefault();
    if (cardNum.length < 16 || cardExp.length < 4 || cardCvv.length < 3) {
      setPaymentError("Invalid card details. Please review your entries.");
      return;
    }
    setPortalStep("loading");
    setTimeout(() => {
      setPortalStep("otp");
    }, 1500);
  };

  const handleBankSubmit = (e) => {
    e.preventDefault();
    if (!selectedBank || !bankUser || !bankPin) {
      setPaymentError("Please fill in your banking credentials.");
      return;
    }
    setPortalStep("loading");
    setTimeout(() => {
      setPortalStep("otp");
    }, 1500);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setPaymentError("Invalid security verification code.");
      return;
    }
    setPortalStep("submitting");
    
    const gateway = paymentPortal === "paystack" ? "paystack" : "ozow";
    const txnRef = `${gateway === "paystack" ? "pstk" : "ozow"}_ref_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const bookingData = {
      tenantId: tenant.id,
      busId,
      from,
      to,
      date,
      seats: seats.map((s) => s.id),
      passengers,
      subtotal: totalPrice,
      tax,
      serviceFee,
      totalAmount,
      currency: currency.id,
      paymentMethod: selectedMethod,
      luggageInfo,
      paymentDetails: {
        status: "PAID",
        ref: txnRef,
        gateway,
        cardBrand: paymentPortal === "paystack" ? "Visa/Mastercard" : undefined,
        bankName: paymentPortal === "ozow" ? selectedBank : undefined,
      }
    };

    setTimeout(async () => {
      const savedBooking = await saveBooking(bookingData);
      setPaymentPortal(null);
      navigate("/confirmation", { state: { ...savedBooking } });
    }, 1500);
  };

  const methods = [
    { id: "paystack", name: "Paystack (Card/EFT)", icon: "💳", color: "#011b33" },
    { id: "ozow", name: "Ozow (Instant EFT)", icon: "⚡", color: "#00b2e3" },
    { id: "snapscan", name: "SnapScan QR", icon: "📸", color: "#f7941d" },
  ];

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#f8f9fa",
      paddingBottom: 40,
      position: "relative"
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
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>For {seats.length} tickets {luggageInfo.bags > 0 && `+ ${luggageInfo.bags} extra bags`}</div>
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

        {selectedMethod === "snapscan" && (
          <div style={{ background: "#fff7ed", padding: 16, borderRadius: 16, border: "1px solid #ffedd5", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: "700", color: "#c2410c", marginBottom: 8 }}>SCAN TO PAY</div>
            <div style={{ margin: "10px auto", width: 80, height: 80, background: "#333", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 40 }}>📸</div>
            <div style={{ fontSize: 11, color: "#7c2d12" }}>Open SnapScan on your phone to scan and pay.</div>
          </div>
        )}

        <button
          disabled={!selectedMethod}
          onClick={handlePaySelection}
          style={{
            background: !selectedMethod ? "#cbd5e1" : tenant.primaryColor,
            color: "#fff",
            border: "none",
            padding: "18px",
            borderRadius: 16,
            fontSize: 16,
            fontWeight: "700",
            cursor: !selectedMethod ? "not-allowed" : "pointer",
            boxShadow: !selectedMethod ? "none" : `0 8px 20px ${tenant.primaryColor}44`,
            marginTop: 10
          }}
        >
          Proceed to Pay {fmtConverted(totalAmount, currency.id)}
        </button>
      </div>

      {/* Paystack Card Sandbox Modal */}
      {paymentPortal === "paystack" && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 24,
            width: "100%",
            maxWidth: 380,
            overflow: "hidden",
            color: "#000",
            fontFamily: "system-ui, sans-serif"
          }}>
            {/* Paystack Blue Header */}
            <div style={{ background: "#011b33", padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: "700", opacity: 0.8 }}>PAYING GENESIS BUS CO.</div>
                <div style={{ fontSize: 20, fontWeight: "800", marginTop: 4 }}>{fmtConverted(totalAmount, currency.id)}</div>
              </div>
              <button onClick={() => setPaymentPortal(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>

            {portalStep === "form" && (
              <form onSubmit={handleCardSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontSize: 12, color: "#12a89d", fontWeight: "700" }}>🔒 SECURE SANDBOXED CARD CHECKOUT</div>
                {paymentError && <div style={{ fontSize: 12, color: "red" }}>{paymentError}</div>}
                
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: "700", color: "#666", marginBottom: 4 }}>CARD NUMBER</label>
                  <input
                    type="text"
                    required
                    value={cardNum}
                    maxLength={16}
                    onChange={(e) => setCardNum(e.target.value.replace(/\D/g, ""))}
                    placeholder="4000 1234 5678 9010"
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
                  />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: "700", color: "#666", marginBottom: 4 }}>EXPIRY DATE</label>
                    <input
                      type="text"
                      required
                      value={cardExp}
                      maxLength={4}
                      placeholder="MMYY"
                      onChange={(e) => setCardExp(e.target.value.replace(/\D/g, ""))}
                      style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: "700", color: "#666", marginBottom: 4 }}>CVV</label>
                    <input
                      type="password"
                      required
                      value={cardCvv}
                      maxLength={3}
                      placeholder="123"
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                      style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: "700", color: "#666", marginBottom: 4 }}>CARDHOLDER NAME</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    placeholder="John Doe"
                    onChange={(e) => setCardName(e.target.value)}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 14, textTransform: "uppercase" }}
                  />
                </div>

                <button type="submit" style={{ width: "100%", background: "#3bb75e", color: "#fff", border: "none", padding: 14, borderRadius: 8, fontSize: 14, fontWeight: "700", cursor: "pointer", marginTop: 10 }}>
                  Pay {fmtConverted(totalAmount, currency.id)}
                </button>
              </form>
            )}

            {portalStep === "loading" && (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🔄</div>
                <div style={{ fontWeight: "700", fontSize: 16 }}>Authorizing Transaction...</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>Communicating with your card provider bank.</div>
              </div>
            )}

            {portalStep === "otp" && (
              <form onSubmit={handleOtpSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ border: "1px solid #bae6fd", background: "#f0f9ff", padding: 12, borderRadius: 8, fontSize: 12, color: "#0369a1", lineHeight: "1.4" }}>
                  <strong>3D Secure Verification:</strong> A verification code has been generated. For testing, enter <strong>123456</strong>.
                </div>
                {paymentError && <div style={{ fontSize: 12, color: "red" }}>{paymentError}</div>}
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: "700", color: "#666", marginBottom: 4 }}>ENTER OTP CODE</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 123456"
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 16, letterSpacing: 6, textAlign: "center" }}
                  />
                </div>
                <button type="submit" style={{ width: "100%", background: "#011b33", color: "#fff", border: "none", padding: 14, borderRadius: 8, fontSize: 14, fontWeight: "700", cursor: "pointer" }}>
                  Verify and Authorize
                </button>
              </form>
            )}

            {portalStep === "submitting" && (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>✨</div>
                <div style={{ fontWeight: "700", fontSize: 16 }}>Payment Approved!</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>Completing booking and allocating seats...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ozow EFT Sandbox Modal */}
      {paymentPortal === "ozow" && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 24,
            width: "100%",
            maxWidth: 380,
            overflow: "hidden",
            color: "#000",
            fontFamily: "system-ui, sans-serif"
          }}>
            {/* Ozow Blue Header */}
            <div style={{ background: "#00b2e3", padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: "700", opacity: 0.8 }}>OZOW SECURE EFT CHECKOUT</div>
                <div style={{ fontSize: 20, fontWeight: "800", marginTop: 4 }}>{fmtConverted(totalAmount, currency.id)}</div>
              </div>
              <button onClick={() => setPaymentPortal(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>

            {portalStep === "form" && (
              <form onSubmit={handleBankSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                {paymentError && <div style={{ fontSize: 12, color: "red" }}>{paymentError}</div>}
                
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: "700", color: "#666", marginBottom: 4 }}>SELECT YOUR BANK</label>
                  <select
                    required
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 14, background: "#fff", fontWeight: "600" }}
                  >
                    <option value="">Choose Bank...</option>
                    <option value="FNB">First National Bank (FNB)</option>
                    <option value="Nedbank">Nedbank</option>
                    <option value="Standard Bank">Standard Bank</option>
                    <option value="Absa">Absa Bank</option>
                    <option value="CBZ">CBZ Bank (ZW)</option>
                    <option value="CABS">CABS (ZW)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: "700", color: "#666", marginBottom: 4 }}>ONLINE BANKING USERNAME</label>
                  <input
                    type="text"
                    required
                    value={bankUser}
                    placeholder="e.g. 123456789"
                    onChange={(e) => setBankUser(e.target.value)}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: "700", color: "#666", marginBottom: 4 }}>BANKING PIN / PASSWORD</label>
                  <input
                    type="password"
                    required
                    value={bankPin}
                    placeholder="••••"
                    onChange={(e) => setBankPin(e.target.value)}
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 }}
                  />
                </div>

                <button type="submit" style={{ width: "100%", background: "#00b2e3", color: "#fff", border: "none", padding: 14, borderRadius: 8, fontSize: 14, fontWeight: "700", cursor: "pointer", marginTop: 10 }}>
                  Log In & Pay
                </button>
              </form>
            )}

            {portalStep === "loading" && (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
                <div style={{ fontWeight: "700", fontSize: 16 }}>Logging in securely...</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>Establishing connection to {selectedBank} gateway.</div>
              </div>
            )}

            {portalStep === "otp" && (
              <form onSubmit={handleOtpSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ border: "1px solid #fed7aa", background: "#fff7ed", padding: 12, borderRadius: 8, fontSize: 12, color: "#c2410c", lineHeight: "1.4" }}>
                  <strong>OTP Authorization:</strong> A test notification has been sent. Enter <strong>123456</strong> to authorize the transfer.
                </div>
                {paymentError && <div style={{ fontSize: 12, color: "red" }}>{paymentError}</div>}
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: "700", color: "#666", marginBottom: 4 }}>OTP CODE</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 123456"
                    style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc", fontSize: 16, letterSpacing: 6, textAlign: "center" }}
                  />
                </div>
                <button type="submit" style={{ width: "100%", background: "#111", color: "#fff", border: "none", padding: 14, borderRadius: 8, fontSize: 14, fontWeight: "700", cursor: "pointer" }}>
                  Confirm Payment
                </button>
              </form>
            )}

            {portalStep === "submitting" && (
              <div style={{ padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>💰</div>
                <div style={{ fontWeight: "700", fontSize: 16 }}>EFT Authorized!</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>Fares successfully transferred. Issuing tickets...</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
