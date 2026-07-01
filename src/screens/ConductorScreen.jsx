import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function ConductorScreen() {
  const [busId, setBusId] = useState("G-401");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [status, setStatus] = useState("Waiting to start...");
  const [watchId, setWatchId] = useState(null);

  const startBroadcasting = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser");
      return;
    }

    setStatus("Locating...");
    setIsBroadcasting(true);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed } = position.coords;
        // Convert speed from m/s to km/h, default to 0 if null
        const speedKmh = speed ? (speed * 3.6).toFixed(2) : 0;
        
        setStatus(`Broadcasting: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} at ${speedKmh} km/h`);

        const travelDate = new Date().toISOString().split("T")[0];
        
        try {
          await supabase.from("fleet_tracking").upsert({
            bus_id: busId,
            travel_date: travelDate,
            lat: latitude,
            lng: longitude,
            speed_kmh: speedKmh,
            updated_at: new Date().toISOString()
          });
        } catch (e) {
          console.error("Failed to push location", e);
        }
      },
      (error) => {
        setStatus(`Error: ${error.message}`);
        setIsBroadcasting(false);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    setWatchId(id);
  };

  const stopBroadcasting = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    setIsBroadcasting(false);
    setStatus("Stopped");
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [watchId]);

  return (
    <div style={{ 
      width: "100%", 
      maxWidth: 420, 
      margin: "0 auto", 
      minHeight: "100vh", 
      background: "#f8f9fa", 
      padding: 24, 
      fontFamily: "'Inter', sans-serif" 
    }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🧑‍✈️</div>
        <h1 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: "900", color: "#1e293b" }}>Conductor Mode</h1>
        <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Select your assigned bus and start broadcasting your GPS location to the passenger app.</p>
      </div>
      
      <div style={{ background: "#fff", padding: 24, borderRadius: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: "800", color: "#94a3b8", marginBottom: 8, textTransform: "uppercase" }}>Select Bus ID</label>
        <select 
          value={busId} 
          onChange={(e) => setBusId(e.target.value)}
          disabled={isBroadcasting}
          style={{ 
            width: "100%", 
            padding: 16, 
            fontSize: 15, 
            fontWeight: "700",
            borderRadius: 12, 
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            color: "#1e293b",
            outline: "none"
          }}
        >
          <option value="G-401">Bus G-401 (Harare to Bulawayo)</option>
          <option value="G-402">Bus G-402 (Harare to Mutare)</option>
          <option value="G-403">Bus G-403 (Bulawayo to Beit Bridge)</option>
        </select>
      </div>

      <div style={{ margin: "20px 0" }}>
        {!isBroadcasting ? (
          <button 
            onClick={startBroadcasting}
            style={{ 
              width: "100%",
              padding: "18px", 
              fontSize: 16, 
              background: "#16a34a", 
              color: "white", 
              border: "none", 
              borderRadius: 16, 
              cursor: "pointer", 
              fontWeight: "800",
              boxShadow: "0 8px 24px rgba(22, 163, 74, 0.3)"
            }}
          >
            ▶ Start Trip Broadcasting
          </button>
        ) : (
          <button 
            onClick={stopBroadcasting}
            style={{ 
              width: "100%",
              padding: "18px", 
              fontSize: 16, 
              background: "#ef4444", 
              color: "white", 
              border: "none", 
              borderRadius: 16, 
              cursor: "pointer", 
              fontWeight: "800",
              boxShadow: "0 8px 24px rgba(239, 68, 68, 0.3)",
              animation: "pulse 2s infinite"
            }}
          >
            ⏹ Stop Broadcasting
          </button>
        )}
      </div>

      <div style={{ marginTop: 24, padding: 20, background: "#f1f5f9", borderRadius: 16, border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 10, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Live GPS Status</div>
        <code style={{ fontSize: 13, fontWeight: "600", color: isBroadcasting ? "#16a34a" : "#64748b" }}>{status}</code>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
