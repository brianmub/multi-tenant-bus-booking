import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { supabase } from "../utils/supabaseClient";
import { useLanguage } from "../context/LanguageContext";
import LogoBox from "../components/LogoBox";
import Nav from "../components/Nav";

export default function HomeScreen() {
  const tenant = useTenant();
  const navigate = useNavigate();
  const { locale, setLocale, t } = useLanguage();
  
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [cities, setCities] = useState(tenant.cities);
  const [popularRoutes, setPopularRoutes] = useState([
    { from: "Harare", to: "Bulawayo", price: 15 },
    { from: "Harare", to: "Mutare", price: 10 },
    { from: "Bulawayo", to: "Beit Bridge", price: 12 },
  ]);

  const [aiQuery, setAiQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch unique routes/cities from schedules database
  useEffect(() => {
    async function loadRoutesAndPopular() {
      try {
        const { data, error } = await supabase
          .from("schedules")
          .select("route_from, route_to, price_usd");
        
        if (error) throw error;

        if (data && data.length > 0) {
          // Extract unique cities
          const dbCities = data.flatMap((s) => [s.route_from, s.route_to]);
          const uniqueCities = Array.from(new Set([...tenant.cities, ...dbCities]));
          setCities(uniqueCities);

          // Extract popular routes
          const uniqueRoutes = [];
          const seen = new Set();
          for (const item of data) {
            const key = `${item.route_from}-${item.route_to}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueRoutes.push({
                from: item.route_from,
                to: item.route_to,
                price: parseFloat(item.price_usd),
              });
            }
            if (uniqueRoutes.length >= 3) break;
          }
          setPopularRoutes(uniqueRoutes);
        }
      } catch (e) {
        console.warn("Falling back to static routes due to connection error:", e.message);
      }
    }
    loadRoutesAndPopular();
  }, []);

  const handleAiSearch = async (e) => {
    e.preventDefault();
    if (!aiQuery) return;
    setIsAiLoading(true);
    try {
      const { getAiSearch } = await import("../utils/ai");
      const result = await getAiSearch(aiQuery, cities);
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
            <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.2)", padding: 4, borderRadius: 20, marginBottom: 12, width: "fit-content" }}>
              {["en", "sn", "nd"].map(l => (
                <button key={l} onClick={() => setLocale(l)} style={{
                  background: locale === l ? "#fff" : "transparent",
                  color: locale === l ? tenant.primaryColor : "#fff",
                  border: "none", borderRadius: 16, padding: "4px 8px", fontSize: 12, fontWeight: "800", cursor: "pointer", textTransform: "uppercase", transition: "0.2s"
                }}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 24, fontWeight: "800" }}>{tenant.name}</div>
          </div>
          <LogoBox size={44} />
        </div>
        <div style={{ fontSize: 16, fontWeight: "500" }}>{t("where_to")}</div>
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
            <label style={{ fontSize: 12, fontWeight: "700", color: "#999", marginBottom: 8, display: "block", textTransform: "uppercase" }}>{t("from")}</label>
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
              {cities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: "700", color: "#999", marginBottom: 8, display: "block", textTransform: "uppercase" }}>{t("to")}</label>
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
              {cities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: "700", color: "#999", marginBottom: 8, display: "block", textTransform: "uppercase" }}>{t("date")}</label>
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
            {t("search_bus")}
          </button>
        </form>
      </div>

      <div style={{ padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: "800", color: "#1a1a1a", margin: 0 }}>{t("recent_searches")}</h3>
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
