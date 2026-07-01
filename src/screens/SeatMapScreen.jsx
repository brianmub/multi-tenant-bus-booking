import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { useCurrency } from "../hooks/useCurrency";
import { fmtConverted } from "../utils/currency";
import { supabase } from "../utils/supabaseClient";
import Nav from "../components/Nav";
import { useLanguage } from "../context/LanguageContext";

export default function SeatMapScreen() {
  const { busId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tenant = useTenant();
  const { currency } = useCurrency();
  const { t } = useLanguage();

  const travelDate = location.state?.date || new Date().toISOString().split("T")[0];
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch booked seats from Supabase
  const loadBookedSeats = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("seats")
        .eq("bus_id", busId)
        .eq("travel_date", travelDate);

      if (error) throw error;

      if (data) {
        // Flatten array of seat lists
        const flattened = data.reduce((acc, row) => [...acc, ...row.seats], []);
        setBookedSeats(flattened);
      }
    } catch (e) {
      console.error("Failed to load booked seats from Supabase:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time listener for database inserts
  useEffect(() => {
    loadBookedSeats();

    // Subscribe to insertion events on the bookings table for this bus
    const channel = supabase
      .channel(`seat-map-${busId}-${travelDate}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `bus_id=eq.${busId}`,
        },
        (payload) => {
          // Verify if it applies to the active travel date
          if (payload.new && payload.new.travel_date === travelDate) {
            console.log("Realtime seat update received!");
            loadBookedSeats();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [busId, travelDate]);

  // Generate 10 rows (2+2 layout)
  const rows = Array.from({ length: 10 }, (_, i) => {
    const rowNum = i + 1;
    const makeSeatObj = (label) => {
      const id = `${rowNum}${label}`;
      return {
        id,
        status: bookedSeats.includes(id) ? "booked" : "available",
      };
    };
    return {
      rowNum,
      left: [makeSeatObj("A"), makeSeatObj("B")],
      right: [makeSeatObj("C"), makeSeatObj("D")],
    };
  });

  const toggleSeat = (seat) => {
    if (seat.status === "booked") return;
    if (selectedSeats.find((s) => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Double-booking prevention check on confirm
  const handleConfirm = async () => {
    if (selectedSeats.length === 0) return;

    try {
      // Re-fetch booked seats directly from Supabase to prevent race conditions
      const { data, error } = await supabase
        .from("bookings")
        .select("seats")
        .eq("bus_id", busId)
        .eq("travel_date", travelDate);

      if (error) throw error;

      if (data) {
        const currentBooked = data.reduce((acc, row) => [...acc, ...row.seats], []);
        const conflictedSeats = selectedSeats.filter((s) => currentBooked.includes(s.id));

        if (conflictedSeats.length > 0) {
          alert(
            `Double-Booking Conflict: Seat(s) ${conflictedSeats
              .map((s) => s.id)
              .join(", ")} have just been booked by another passenger. Please select alternative seats.`
          );
          // Update visual states immediately
          setBookedSeats(currentBooked);
          setSelectedSeats(selectedSeats.filter((s) => !currentBooked.includes(s.id)));
          return;
        }
      }
    } catch (e) {
      console.error("Checkout concurrency verification failed:", e.message);
    }

    // Proceed if no conflicts
    navigate("/passenger", {
      state: {
        seats: selectedSeats,
        totalPrice,
        busId,
        date: travelDate,
      },
    });
  };

  const totalPrice = selectedSeats.length * 15; // $15 per seat

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#f8f9fa",
      paddingBottom: 120,
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
            <div style={{ fontSize: 18, fontWeight: "800" }}>Select Seats</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              Bus #{busId} • Executive • {new Date(travelDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: "600" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#fff" }} /> {t("available")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: "600" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: tenant.primaryColor }} /> {t("selected")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: "600" }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(255,255,255,0.3)" }} /> {t("booked")}
          </div>
        </div>

        {/* Urgency Banner */}
        <div style={{ 
          marginTop: 20, 
          background: "rgba(254, 240, 138, 0.2)", 
          border: "1px solid rgba(253, 224, 71, 0.4)", 
          padding: "12px 16px", 
          borderRadius: 12, 
          fontSize: 13, 
          fontWeight: "700", 
          color: "#fef08a",
          display: "flex",
          alignItems: "center",
          gap: 8,
          lineHeight: "1.4"
        }}>
          {t("book_early")}
        </div>
      </div>

      {/* Seat Map */}
      <div style={{ padding: "30px 24px" }}>
        <div style={{ 
          background: "#fff", 
          borderRadius: 30, 
          padding: "40px 20px", 
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", fontSize: 13 }}>
              Loading seat map...
            </div>
          ) : (
            <>
              {/* Steering Wheel */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ background: "#fef9c3", border: "1px solid #fde047", padding: "4px 8px", borderRadius: 8, fontSize: 10, fontWeight: "800", color: "#854d0e" }}>
                    ✨ AI RECOMMENDED
                  </div>
                </div>
                <div style={{ fontSize: 24 }}>🎡</div>
              </div>

              {rows.map((row) => (
                <div key={row.rowNum} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    {row.left.map((seat) => {
                      const isSelected = selectedSeats.find((s) => s.id === seat.id);
                      const isRecommended = seat.id === "1A" || seat.id === "1B";
                      const isQuiet = seat.id === "10A" || seat.id === "10B";
                      
                      return (
                        <div key={seat.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <button
                            onClick={() => toggleSeat(seat)}
                            disabled={seat.status === "booked"}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: "none",
                              background: seat.status === "booked" ? "#e2e8f0" : isSelected ? tenant.primaryColor : isRecommended ? "#fef9c3" : isQuiet ? "#f0f9ff" : "#fff",
                              color: isSelected ? "#fff" : seat.status === "booked" ? "#94a3b8" : (isRecommended || isQuiet) ? "#1e293b" : "#64748b",
                              fontSize: 10,
                              fontWeight: "800",
                              cursor: seat.status === "booked" ? "not-allowed" : "pointer",
                              boxShadow: isSelected ? `0 4px 12px ${tenant.primaryColor}66` : "0 2px 6px rgba(0,0,0,0.05)",
                              border: isSelected ? "none" : (isRecommended ? "1px solid #fde047" : isQuiet ? "1px solid #bae6fd" : "1px solid #e2e8f0"),
                              position: "relative"
                            }}
                          >
                            {seat.id}
                            {isRecommended && !isSelected && <span style={{ position: "absolute", top: -8, right: -8, fontSize: 12 }}>⭐</span>}
                            {isQuiet && !isSelected && <span style={{ position: "absolute", top: -8, right: -8, fontSize: 12 }}>🌙</span>}
                          </button>
                          <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>
                            {seat.id.includes("A") ? "Window" : "Aisle"}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: 10, color: "#cbd5e1", fontWeight: "700" }}>{row.rowNum}</div>

                  <div style={{ display: "flex", gap: 10 }}>
                    {row.right.map((seat) => {
                      const isSelected = selectedSeats.find((s) => s.id === seat.id);
                      const isRecommended = seat.id === "2C";
                      
                      return (
                        <div key={seat.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <button
                            onClick={() => toggleSeat(seat)}
                            disabled={seat.status === "booked"}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              border: "none",
                              background: seat.status === "booked" ? "#e2e8f0" : isSelected ? tenant.primaryColor : isRecommended ? "#fef9c3" : "#fff",
                              color: isSelected ? "#fff" : seat.status === "booked" ? "#94a3b8" : isRecommended ? "#1e293b" : "#64748b",
                              fontSize: 10,
                              fontWeight: "800",
                              cursor: seat.status === "booked" ? "not-allowed" : "pointer",
                              boxShadow: isSelected ? `0 4px 12px ${tenant.primaryColor}66` : "0 2px 6px rgba(0,0,0,0.05)",
                              border: isSelected ? "none" : (isRecommended ? "1px solid #fde047" : "1px solid #e2e8f0"),
                              position: "relative"
                            }}
                          >
                            {seat.id}
                            {isRecommended && !isSelected && <span style={{ position: "absolute", top: -8, right: -8, fontSize: 12 }}>⭐</span>}
                          </button>
                          <div style={{ fontSize: 8, color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>
                            {seat.id.includes("D") ? "Window" : "Aisle"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      {selectedSeats.length > 0 && !isLoading && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          padding: "20px 24px calc(20px + env(safe-area-inset-bottom))",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 101,
          borderRadius: "32px 32px 0 0"
        }}>
          <div>
            <div style={{ fontSize: 12, color: "#666", fontWeight: "600" }}>{selectedSeats.length} Seats Selected</div>
            <div style={{ fontSize: 20, fontWeight: "900", color: tenant.primaryColor }}>
              {fmtConverted(totalPrice, currency.id)}
            </div>
          </div>
          <button
            onClick={handleConfirm}
            style={{
              background: tenant.primaryColor,
              color: "#fff",
              border: "none",
              padding: "14px 32px",
              borderRadius: 16,
              fontSize: 16,
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: `0 8px 20px ${tenant.primaryColor}44`
            }}
          >
            {t("confirm")}
          </button>
        </div>
      )}

      {!selectedSeats.length && !isLoading && <Nav />}
    </div>
  );
}
