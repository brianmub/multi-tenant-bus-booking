import { useNavigate, useParams } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

// We dynamically import leaflet components so they don't break if map is disabled
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const busIcon = new L.DivIcon({
  className: "custom-bus-icon",
  html: `<div style="background:#1e293b; color:white; width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:24px; border:3px solid white; box-shadow:0 6px 12px rgba(0,0,0,0.3);">🚌</div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

// Component to dynamically recenter map when liveLocation changes
function RecenterMap({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.setView(location, map.getZoom(), { animate: true });
  }, [location, map]);
  return null;
}

export default function LiveTrackingScreen() {
  const navigate = useNavigate();
  const tenant = useTenant();
  const { id } = useParams();

  const [mapEnabled, setMapEnabled] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  
  // For sandbox purposes, track G-401
  const busId = "G-401"; 
  const travelDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const checkSettings = async () => {
      const { data } = await supabase.from("app_settings").select("settings").eq("id", "global").single();
      if (data?.settings?.enable_live_map) {
        setMapEnabled(true);
      }
    };
    checkSettings();

    const fetchLocation = async () => {
      const { data } = await supabase.from("fleet_tracking").select("*").eq("bus_id", busId).eq("travel_date", travelDate).single();
      if (data && data.lat) {
        setLiveLocation([data.lat, data.lng]);
        setSpeed(data.speed_kmh);
      } else {
        // Fallback Harare coordinates
        setLiveLocation([-17.824858, 31.053028]);
      }
    };
    fetchLocation();

    // Subscribe to realtime location updates
    const channel = supabase.channel(`tracking-${busId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fleet_tracking', filter: `bus_id=eq.${busId}` }, (payload) => {
        if (payload.new && payload.new.lat) {
          setLiveLocation([payload.new.lat, payload.new.lng]);
          setSpeed(payload.new.speed_kmh);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [busId, travelDate]);

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#f8f9fa",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Top Bar over map */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "24px 24px 40px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
        color: "#fff",
        zIndex: 1000
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
            <div style={{ fontSize: 18, fontWeight: "800" }}>Live Tracking</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>Booking #{id || "GEN-TXN-01"}</div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div style={{
        flex: 1,
        background: "#e2e8f0",
        position: "relative",
        overflow: "hidden"
      }}>
        {mapEnabled && liveLocation ? (
          <MapContainer 
            center={liveLocation} 
            zoom={14} 
            style={{ width: "100%", height: "100%", zIndex: 0 }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <Marker position={liveLocation} icon={busIcon}>
              <Popup>Bus {busId} is moving at {speed} km/h</Popup>
            </Marker>
            <RecenterMap location={liveLocation} />
          </MapContainer>
        ) : (
          // CSS Fallback Layout
          <>
            <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <div style={{
              position: "absolute", top: "20%", left: "50%", width: 8, height: "60%",
              background: "#cbd5e1", borderRadius: 4, transform: "translateX(-50%)"
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "75%",
                background: tenant.primaryColor, borderRadius: 4
              }} />
            </div>

            <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", border: `4px solid ${tenant.primaryColor}` }} />
              <div style={{ fontSize: 12, fontWeight: "800", color: "#334155", background: "#fff", padding: "2px 8px", borderRadius: 8 }}>Harare</div>
            </div>

            <div style={{ position: "absolute", top: "65%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 5 }}>
              <div style={{ background: "#fff", padding: "8px 12px", borderRadius: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", fontSize: 12, fontWeight: "800", color: tenant.primaryColor, display: "flex", alignItems: "center", gap: 6, animation: "pulse 2s infinite" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                {speed > 0 ? `${speed} km/h` : "CSS Estimation Mode"}
              </div>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: tenant.primaryColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: "3px solid #fff" }}>🚌</div>
            </div>

            <div style={{ position: "absolute", bottom: "15%", left: "50%", transform: "translate(-50%, 50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "4px solid #cbd5e1" }} />
              <div style={{ fontSize: 12, fontWeight: "800", color: "#64748b", background: "#fff", padding: "2px 8px", borderRadius: 8 }}>Johannesburg</div>
            </div>
          </>
        )}
      </div>

      {/* Speed & ETA Panel Overlay */}
      {mapEnabled && speed > 0 && (
         <div style={{
           position: "absolute",
           bottom: 180,
           right: 24,
           background: "#fff",
           padding: "8px 12px",
           borderRadius: 16,
           boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
           fontSize: 14,
           fontWeight: "900",
           color: tenant.primaryColor,
           display: "flex",
           alignItems: "center",
           gap: 6,
           zIndex: 1000,
           animation: "pulse 2s infinite"
         }}>
           <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
           {speed} km/h
         </div>
      )}

      {/* Bottom Information Panel */}
      <div style={{
        background: "#fff",
        borderRadius: "32px 32px 0 0",
        padding: "32px 24px",
        marginTop: -32,
        position: "relative",
        zIndex: 2000,
        boxShadow: "0 -10px 40px rgba(0,0,0,0.08)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
           <div>
             <div style={{ fontSize: 12, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" }}>Estimated Arrival</div>
             <div style={{ fontSize: 32, fontWeight: "900", color: "#1e293b", letterSpacing: "-1px" }}>18:45 PM</div>
           </div>
           <div style={{ textAlign: "right" }}>
             <div style={{ fontSize: 12, fontWeight: "800", color: "#16a34a" }}>ON TIME</div>
             <div style={{ fontSize: 14, fontWeight: "800", color: "#334155" }}>~2 hrs away</div>
           </div>
        </div>

        <div style={{ 
          background: "#f0f9ff", 
          border: "1px solid #bae6fd", 
          borderRadius: 16, 
          padding: 16,
          display: "flex",
          gap: 12,
          alignItems: "flex-start"
        }}>
          <span style={{ fontSize: 20 }}>📍</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: "800", color: "#0369a1" }}>GPS Active</div>
            <div style={{ fontSize: 12, color: "#0c4a6e", marginTop: 4, lineHeight: "1.4" }}>
              {mapEnabled ? "You are viewing the real-time geographic location of the bus, updated directly from the conductor." : "Geographic maps disabled by operator. View is simulated."}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
