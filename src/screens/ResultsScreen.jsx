import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { supabase } from "../utils/supabaseClient";
import BusCard from "../components/BusCard";
import Nav from "../components/Nav";
import CurrencyBar from "../components/CurrencyBar";
import AdminCutoffPanel from "../admin/AdminCutoffPanel";
import { getFleet, getBusDetails } from "../utils/fleet";
import { getOccupancy } from "../utils/storage";

const isAdminMode = import.meta.env.VITE_ADMIN_MODE === "true";

export default function ResultsScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tenant = useTenant();

  const [cutoffConfig, setCutoffConfig] = useState({
    bookingCutoffMins: 30,
    closingSoonMins: 60,
  });

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSchedules() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("schedules")
          .select("*")
          .eq("route_from", from)
          .eq("route_to", to);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map((sch) => {
            const bus = getBusDetails(sch.bus_id) || { reg: "GEN-01", capacity: 40, class: "Luxury VIP" };
            const occupied = getOccupancy(sch.bus_id, date);
            const available = bus.capacity - occupied;

            return {
              id: sch.bus_id,
              reg: bus.reg,
              model: bus.model || "Scania Marcopolo G8",
              capacity: bus.capacity,
              class: bus.class,
              time: sch.departure_time,
              routeName: `${from} to ${to}`,
              price: parseFloat(sch.price_usd),
              availableSeats: available,
              busNumber: bus.reg,
            };
          });
          setBuses(mapped);
        } else {
          // Fallback to static mapping if database is unseeded
          const fleet = getFleet();
          const fallback = fleet.map((bus, index) => {
            const occupied = getOccupancy(bus.id, date);
            const available = bus.capacity - occupied;
            const hour = 8 + index * 2;
            const time = `${hour < 10 ? "0" + hour : hour}:30 AM`;

            return {
              ...bus,
              time,
              routeName: `${from} to ${to}`,
              price: bus.class === "Luxury VIP" ? 25 : bus.class === "Executive" ? 20 : 15,
              availableSeats: available,
              busNumber: bus.reg,
            };
          });
          setBuses(fallback);
        }
      } catch (err) {
        console.warn("Error loading database schedules, falling back to static fleet:", err.message);
        // Fallback
        const fleet = getFleet();
        const fallback = fleet.map((bus, index) => {
          const occupied = getOccupancy(bus.id, date);
          const available = bus.capacity - occupied;
          const hour = 8 + index * 2;
          const time = `${hour < 10 ? "0" + hour : hour}:30 AM`;

          return {
            ...bus,
            time,
            routeName: `${from} to ${to}`,
            price: bus.class === "Luxury VIP" ? 25 : bus.class === "Executive" ? 20 : 15,
            availableSeats: available,
            busNumber: bus.reg,
          };
        });
        setBuses(fallback);
      } finally {
        setIsLoading(false);
      }
    }

    if (from && to) {
      loadSchedules();
    }
  }, [from, to, date]);

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
            <div style={{ fontSize: 18, fontWeight: "800" }}>{from} → {to}</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>
        
        <CurrencyBar />
      </div>

      {/* Results */}
      <div style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: "#666", fontWeight: "600" }}>
            {isLoading ? "Searching routes..." : `${buses.length} Buses found`}
          </span>
          <button style={{ background: "none", border: "none", color: tenant.primaryColor, fontWeight: "700", fontSize: 14 }}>Filter ⚙️</button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", fontSize: 14 }}>
            Searching database...
          </div>
        ) : (
          buses.map((bus) => (
            <BusCard 
              key={bus.id} 
              bus={bus} 
              cutoffConfig={cutoffConfig}
              onClick={() => navigate(`/seats/${bus.id}`, { state: { date } })}
            />
          ))
        )}
      </div>

      {isAdminMode && (
        <AdminCutoffPanel config={cutoffConfig} onChange={setCutoffConfig} />
      )}

      <Nav />
    </div>
  );
}
