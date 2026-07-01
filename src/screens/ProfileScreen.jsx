import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { useUser } from "../context/UserContext";
import { supabase } from "../utils/supabaseClient";
import Nav from "../components/Nav";

export default function ProfileScreen() {
  const tenant = useTenant();
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useUser();

  // Local form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passport, setPassport] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [smartSearch, setSmartSearch] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Saved passengers state
  const [savedPassengers, setSavedPassengers] = useState([]);
  const [newPassengerName, setNewPassengerName] = useState("");
  const [newPassengerPassport, setNewPassengerPassport] = useState("");
  const [showAddPassenger, setShowAddPassenger] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Populate form fields when profile loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setPassport(profile.passport || "");
      setCurrency(profile.preferred_currency || "USD");
      setSavedPassengers(profile.saved_passengers || []);
    }
  }, [profile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          phone,
          passport,
          preferred_currency: currency,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    } catch (err) {
      console.error("Error updating profile in Supabase:", err.message);
      alert("Failed to save profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPassenger = async (e) => {
    e.preventDefault();
    if (!newPassengerName || !newPassengerPassport || !user) return;

    const newPassenger = {
      id: Date.now().toString(),
      name: newPassengerName,
      passport: newPassengerPassport,
    };

    const updatedList = [...savedPassengers, newPassenger];
    setSavedPassengers(updatedList);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ saved_passengers: updatedList })
        .eq("id", user.id);

      if (error) throw error;

      setNewPassengerName("");
      setNewPassengerPassport("");
      setShowAddPassenger(false);
    } catch (err) {
      console.error("Failed to add passenger card:", err.message);
    }
  };

  const handleDeletePassenger = async (id) => {
    const updatedList = savedPassengers.filter((p) => p.id !== id);
    setSavedPassengers(updatedList);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ saved_passengers: updatedList })
        .eq("id", user.id);

      if (error) throw error;
    } catch (err) {
      console.error("Failed to delete passenger card:", err.message);
    }
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#64748b", fontWeight: "600" }}>Loading Profile...</p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!user) {
    return (
      <div style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        minHeight: "100vh",
        background: "#f8f9fa",
        padding: "60px 24px 110px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: "#1e1e1e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
          marginBottom: 24,
          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
        }}>
          👤
        </div>
        <h2 style={{ fontSize: 22, fontWeight: "900", color: "#0f172a", margin: "0 0 10px" }}>Genesis Profile</h2>
        <p style={{ fontSize: 14, color: "#64748b", lineHeight: "1.6", maxWidth: 300, margin: "0 0 32px" }}>
          Log in to your Genesis account to save passenger details, access trip receipts, and book tickets instantly.
        </p>

        <button
          onClick={() => navigate("/login", { state: { from: "/profile" } })}
          style={{
            width: "100%",
            background: tenant.primaryColor,
            color: "#121212",
            border: "none",
            padding: "16px",
            borderRadius: 16,
            fontSize: 16,
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: `0 8px 24px ${tenant.primaryColor}44`,
            marginBottom: 20
          }}
        >
          Sign In / Sign Up
        </button>

        <span
          onClick={() => navigate("/home")}
          style={{ fontSize: 13, color: "#64748b", cursor: "pointer", textDecoration: "underline" }}
        >
          Browse Routes as Guest
        </span>
        <Nav />
      </div>
    );
  }

  // 3. Authenticated State
  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#f8f9fa",
      paddingBottom: 110,
      position: "relative",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: tenant.bgGradient,
        padding: "40px 24px 60px",
        borderRadius: "0 0 32px 32px",
        color: "#fff",
        textAlign: "center",
        position: "relative"
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(8px)",
          border: "2px solid rgba(255,255,255,0.4)",
          margin: "0 auto 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          fontWeight: "800",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)"
        }}>
          {name ? name.charAt(0).toUpperCase() : "👤"}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: "800", margin: "0 0 4px" }}>{name}</h2>
        <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>{email}</p>
        
        <div style={{
          display: "inline-block",
          marginTop: 12,
          background: "rgba(255,255,255,0.15)",
          padding: "6px 16px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: "0.5px"
        }}>
          ✨ GOLD MEMBER
        </div>
      </div>

      {/* Main Profile Form */}
      <div style={{ padding: "0 20px", marginTop: -30 }}>
        <form onSubmit={handleSaveProfile} style={{
          background: "#fff",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <h3 style={{ fontSize: 16, fontWeight: "800", margin: "0 0 4px", color: "#1e293b" }}>Personal Details</h3>

          <div>
            <label style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, display: "block" }}>FULL NAME</label>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 14,
                fontWeight: "600",
                background: "#fcfcfc",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, display: "block" }}>EMAIL ADDRESS</label>
            <input 
              disabled
              required
              type="email"
              value={email}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 14,
                fontWeight: "600",
                background: "#f3f4f6", // disabled gray
                color: "#64748b",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, display: "block" }}>PHONE NUMBER</label>
            <input 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 14,
                fontWeight: "600",
                background: "#fcfcfc",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, display: "block" }}>ID / PASSPORT NUMBER</label>
            <input 
              required
              value={passport}
              onChange={(e) => setPassport(e.target.value)}
              placeholder="ID / Passport Number"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 14,
                fontWeight: "600",
                background: "#fcfcfc",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", marginBottom: 6, display: "block" }}>PREFERRED CURRENCY</label>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 14,
                fontWeight: "600",
                background: "#fcfcfc",
                outline: "none"
              }}
            >
              {tenant.acceptedCurrencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              background: tenant.primaryColor,
              color: "#121212",
              border: "none",
              padding: "14px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: "700",
              cursor: isSaving ? "not-allowed" : "pointer",
              boxShadow: `0 8px 20px ${tenant.primaryColor}33`,
              marginTop: 4,
              transition: "0.2s"
            }}
          >
            {isSaving ? "Saving..." : "Save Profile Details"}
          </button>
        </form>
      </div>

      {/* Saved Passengers */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{
          background: "#fff",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: "800", margin: 0, color: "#1e293b" }}>Saved Passengers</h3>
            <button 
              onClick={() => setShowAddPassenger(!showAddPassenger)}
              style={{
                background: `${tenant.primaryColor}15`,
                color: tenant.primaryColor,
                border: "none",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {showAddPassenger ? "Cancel" : "+ Add New"}
            </button>
          </div>

          {showAddPassenger && (
            <form onSubmit={handleAddPassenger} style={{
              background: "#f8f9fa",
              padding: 16,
              borderRadius: 16,
              marginBottom: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              border: `1px solid ${tenant.primaryColor}22`
            }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: "700", color: "#64748b", marginBottom: 4, display: "block" }}>PASSENGER NAME</label>
                <input 
                  required
                  value={newPassengerName}
                  onChange={(e) => setNewPassengerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    background: "#fff"
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: "700", color: "#64748b", marginBottom: 4, display: "block" }}>ID / PASSPORT NUMBER</label>
                <input 
                  required
                  value={newPassengerPassport}
                  onChange={(e) => setNewPassengerPassport(e.target.value)}
                  placeholder="e.g. 12-345678-X-90"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    background: "#fff"
                  }}
                />
              </div>
              <button 
                type="submit"
                style={{
                  background: tenant.primaryColor,
                  color: "#121212",
                  border: "none",
                  padding: "10px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Add Passenger
              </button>
            </form>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {savedPassengers.length === 0 ? (
              <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", margin: "12px 0" }}>No saved passengers yet.</p>
            ) : (
              savedPassengers.map((passenger) => (
                <div key={passenger.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "#f8f9fa",
                  borderRadius: 12,
                  border: "1px solid #eee"
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "700", color: "#334155" }}>{passenger.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>ID: {passenger.passport}</div>
                  </div>
                  <button 
                    onClick={() => handleDeletePassenger(passenger.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      fontSize: 16,
                      cursor: "pointer",
                      padding: 4
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Preferences & System Settings */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{
          background: "#fff",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <h3 style={{ fontSize: 16, fontWeight: "800", margin: 0, color: "#1e293b" }}>App Settings</h3>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: "700", color: "#334155" }}>✨ AI Smart Search</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Contextual natural language travel assistant</div>
            </div>
            <input 
              type="checkbox" 
              checked={smartSearch}
              onChange={(e) => setSmartSearch(e.target.checked)}
              style={{
                width: 44,
                height: 24,
                cursor: "pointer",
                accentColor: tenant.primaryColor
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: "700", color: "#334155" }}>🔔 Push Notifications</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Instant updates for booking and live schedules</div>
            </div>
            <input 
              type="checkbox" 
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              style={{
                width: 44,
                height: 24,
                cursor: "pointer",
                accentColor: tenant.primaryColor
              }}
            />
          </div>
        </div>
      </div>

      {/* Help & Support Button */}
      <div style={{ padding: "24px 20px 0" }}>
        <button
          onClick={() => navigate("/support")}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 16,
            background: "#fff",
            border: "1px solid #e2e8f0",
            color: "#1e293b",
            fontSize: 14,
            fontWeight: "800",
            cursor: "pointer",
            transition: "0.2s",
            boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
          }}
        >
          🎧 Customer Help & Support
        </button>
      </div>

      {/* Log Out Button */}
      <div style={{ padding: "24px 20px 0" }}>
        <button
          onClick={signOut}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 16,
            background: "#fee2e2",
            border: "none",
            color: "#ef4444",
            fontSize: 14,
            fontWeight: "700",
            cursor: "pointer",
            transition: "0.2s"
          }}
        >
          Sign Out of Account
        </button>
      </div>

      {/* Floating Save Toast Notification */}
      {showSavedToast && (
        <div style={{
          position: "fixed",
          bottom: 90,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1e293b",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 20,
          fontSize: 13,
          fontWeight: "600",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "all 0.3s ease"
        }}>
          <span>✅</span> Profile updated successfully!
        </div>
      )}

      <Nav />
    </div>
  );
}
