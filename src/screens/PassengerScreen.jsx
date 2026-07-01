import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { useUser } from "../context/UserContext";
import BillBreakdown from "../components/BillBreakdown";

export default function PassengerScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const tenant = useTenant();
  const { profile } = useUser();

  const { seats = [], totalPrice = 0, busId } = state || {};

  const [passengers, setPassengers] = useState(
    seats.map((seat) => ({
      seatId: seat.id,
      name: "",
      idNumber: "",
      gender: "",
      nationality: "",
      dob: "",
    }))
  );

  const [extraBags, setExtraBags] = useState(0);
  const luggageFee = extraBags * 5.0; // $5 per bag

  const updatePassenger = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const autofillPassenger = (index, savedItem) => {
    const newPassengers = [...passengers];
    newPassengers[index].name = savedItem.name;
    newPassengers[index].idNumber = savedItem.passport;
    setPassengers(newPassengers);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    navigate("/payment", {
      state: {
        ...state,
        passengers,
        luggageInfo: {
          bags: extraBags,
          fee: luggageFee,
        },
        totalPriceWithLuggage: totalPrice + luggageFee,
      },
    });
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    fontWeight: "600",
    background: "#fcfcfc",
    outline: "none",
  };

  const labelStyle = {
    fontSize: 10,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 6,
    display: "block",
  };

  const counterBtnStyle = {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: 18,
    fontWeight: "800",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    outline: "none",
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: "800", color: tenant.primaryColor }}>PASSENGER {i + 1}</div>
              <div style={{ fontSize: 12, fontWeight: "700", color: "#64748b" }}>SEAT {p.seatId}</div>
            </div>

            {/* Saved Passengers Autofill option */}
            {profile?.saved_passengers && profile.saved_passengers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>AUTOFILL FROM SAVED PASSENGERS</label>
                <select
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const match = profile.saved_passengers.find((sp) => sp.id === selectedId);
                    if (match) autofillPassenger(i, match);
                    e.target.value = ""; // Reset
                  }}
                  style={{
                    ...inputStyle,
                    padding: "8px 12px",
                    background: `${tenant.primaryColor}10`,
                    borderColor: `${tenant.primaryColor}30`,
                    color: tenant.primaryColor,
                    fontSize: 13,
                  }}
                >
                  <option value="">Select Saved Passenger...</option>
                  {profile.saved_passengers.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <input 
                  required
                  value={p.name}
                  onChange={(e) => updatePassenger(i, "name", e.target.value)}
                  placeholder="As shown in Passport/ID"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>ID / PASSPORT NUMBER</label>
                <input 
                  required
                  value={p.idNumber}
                  onChange={(e) => updatePassenger(i, "idNumber", e.target.value)}
                  placeholder="e.g. ZW-12345678"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>GENDER</label>
                  <select
                    required
                    value={p.gender}
                    onChange={(e) => updatePassenger(i, "gender", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>NATIONALITY</label>
                  <select
                    required
                    value={p.nationality}
                    onChange={(e) => updatePassenger(i, "nationality", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    <option value="Zimbabwean">Zimbabwean</option>
                    <option value="South African">South African</option>
                    <option value="Zambian">Zambian</option>
                    <option value="Botswanan">Botswanan</option>
                    <option value="Mozambican">Mozambican</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>DATE OF BIRTH</label>
                <input
                  type="date"
                  required
                  value={p.dob}
                  onChange={(e) => updatePassenger(i, "dob", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Luggage Declaration */}
        <div style={{ 
          background: "#fff", 
          padding: 20, 
          borderRadius: 24, 
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)" 
        }}>
          <div style={{ fontSize: 14, fontWeight: "800", color: tenant.primaryColor, marginBottom: 6 }}>LUGGAGE DECLARATION</div>
          <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px", lineHeight: "1.4" }}>
            Each ticket includes 1 free carry-on bag. Additional items are charged a flat rate of **$5.00** per bag.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: "700", color: "#334155" }}>Extra Check-in Bags</span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button 
                type="button" 
                onClick={() => setExtraBags(Math.max(0, extraBags - 1))}
                style={counterBtnStyle}
              >
                -
              </button>
              <span style={{ fontSize: 16, fontWeight: "900", color: "#0f172a", width: 16, textAlign: "center" }}>{extraBags}</span>
              <button 
                type="button" 
                onClick={() => setExtraBags(extraBags + 1)}
                style={counterBtnStyle}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <BillBreakdown subtotal={totalPrice} seatsCount={seats.length} luggageFee={luggageFee} />

        <button
          type="submit"
          style={{
            background: tenant.primaryColor,
            color: "#121212",
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
