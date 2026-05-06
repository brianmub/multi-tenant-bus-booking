import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import LogoBox from "../components/LogoBox";
import Nav from "../components/Nav";

export default function HomeScreen() {
  const tenant = useTenant();
  const navigate = useNavigate();
  
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [aiQuery, setAiQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!aiQuery) return;
    setIsAiLoading(true);
    try {
      const { getAiSearch } = await import("../utils/ai");
      const result = await getAiSearch(aiQuery, tenant.cities);
      if (result.from) setFrom(result.from);
      if (result.to) setTo(result.to);
      if (result.date) setDate(result.date);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
      setAiQuery("");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!from || !to) return;
    navigate(`/results?from=${from}&to=${to}&date=${date}`);
  };

  const popularRoutes = [
    { from: "Harare", to: "Bulawayo", price: 15 },
    { from: "Harare", to: "Mutare", price: 10 },
    { from: "Bulawayo", to: "Victoria Falls", price: 20 },
  ];

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
        padding: "40px 24px 60px",
        borderRadius: "0 0 32px 32px",
        color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.8, fontWeight: "600" }}>Welcome to</div>
            <div style={{ fontSize: 24, fontWeight: "800" }}>{tenant.name}</div>
          </div>
          <LogoBox size={44} />
        </div>
        <div style={{ fontSize: 16, fontWeight: "500" }}>Where are you heading today?</div>
      </div>

      {/* AI Search Assistant */}
      <div style={{
        margin: "-30px 20px 0",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        borderRadius: 20,
        padding: "16px 20px",
        border: `1px solid ${tenant.primaryColor}33`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        position: "relative",
        zIndex: 2
      }}>
        <form onSubmit={handleAiSearch} style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>✨</span>
            <input 
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Try: 'Bus to Bulawayo on Friday'..."
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                borderRadius: 12,
                border: "none",
                background: "#f1f5f9",
                fontSize: 14,
                fontWeight: "500",
                outline: "none"
              }}
            />
          </div>
          <button 
            disabled={isAiLoading}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: tenant.primaryColor,
              color: "#fff",
              border: "none",
              fontWeight: "700",
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {isAiLoading ? "..." : "Ask AI"}
          </button>
        </form>
      </div>

      {/* Search Card */}
      <div style={{
        margin: "20px 20px 0",
        background: "#fff",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
      }}>
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: "700", color: "#999", marginBottom: 8, display: "block" }}>FROM</label>
            <select 
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #eee",
                fontSize: 16,
                fontWeight: "600",
                background: "#fcfcfc"
              }}
            >
              <option value="">Select City</option>
              {tenant.cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: "700", color: "#999", marginBottom: 8, display: "block" }}>TO</label>
            <select 
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #eee",
                fontSize: 16,
                fontWeight: "600",
                background: "#fcfcfc"
              }}
            >
              <option value="">Select City</option>
              {tenant.cities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: "700", color: "#999", marginBottom: 8, display: "block" }}>TRAVEL DATE</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 12,
                border: "1px solid #eee",
                fontSize: 16,
                fontWeight: "600",
                background: "#fcfcfc"
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 8,
              background: tenant.primaryColor,
              color: "#fff",
              border: "none",
              padding: "16px",
              borderRadius: 16,
              fontSize: 16,
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: `0 8px 20px ${tenant.primaryColor}44`
            }}
          >
            Search Buses
          </button>
        </form>
      </div>

      {/* Popular Routes */}
      <div style={{ padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: "800", color: "#1a1a1a", margin: 0 }}>Popular Routes</h3>
          <span style={{ fontSize: 13, color: tenant.primaryColor, fontWeight: "700" }}>See all</span>
        </div>
        
        {popularRoutes.map((route, i) => (
          <div 
            key={i} 
            onClick={() => {
              setFrom(route.from);
              setTo(route.to);
            }}
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              cursor: "pointer"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 20 }}>📍</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: "700" }}>{route.from} → {route.to}</div>
                <div style={{ fontSize: 12, color: "#999" }}>Daily departures</div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: "800", color: tenant.primaryColor }}>From ${route.price}</div>
          </div>
        ))}
      </div>

      <Nav />
    </div>
  );
}
