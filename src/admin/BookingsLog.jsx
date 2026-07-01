import { useState, useEffect } from "react";
import { getAllBookings, syncBookingsFromDb } from "../utils/storage";
import { getFleet } from "../utils/fleet";

export default function BookingsLog() {
  const [bookings, setBookings] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const fleet = getFleet();

  // Load and sync bookings on mount
  useEffect(() => {
    async function load() {
      setIsSyncing(true);
      await syncBookingsFromDb();
      setBookings(getAllBookings().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setIsSyncing(false);
    }
    load();

    // Default to the first bus in the fleet list
    if (fleet.length > 0) {
      setSelectedBusId(fleet[0].id);
    }
  }, []);

  const selectedBus = fleet.find((b) => b.id === selectedBusId) || fleet[0];

  // Filter bookings for the selected bus and date to compile the manifesto
  const manifestoBookings = bookings.filter((b) => {
    // Ensure travel date strings match
    const bDate = new Date(b.date).toDateString();
    const sDate = new Date(selectedDate).toDateString();
    return b.busId === selectedBusId && bDate === sDate;
  });

  // Extract flat list of passengers with their respective seat labels
  const manifestoPassengers = [];
  manifestoBookings.forEach((b) => {
    b.passengers.forEach((p, idx) => {
      manifestoPassengers.push({
        name: p.name,
        passport: p.passport,
        seat: b.seats[idx] || "N/A",
        bookingId: b.id,
      });
    });
  });

  // Trigger browser print dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Dynamic print-only style block */}
      <style>{`
        @media print {
          /* Hide everything in the viewport */
          body * {
            visibility: hidden;
            background: none !important;
          }
          /* Show only the print area and its children */
          #manifesto-print-area, #manifesto-print-area * {
            visibility: visible;
          }
          #manifesto-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          /* Prevent page breaks inside signature block */
          .no-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Main Admin Log View */}
      <header style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: "900", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            Bookings Log
          </h1>
          <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: 15 }}>
            View tickets issued and print official border passenger manifestos.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              fontSize: 14,
              fontWeight: "700",
              background: "#d4af37",
              color: "#121212",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(212,175,55,0.2)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "0.2s",
            }}
          >
            📋 Print Border Manifesto
          </button>
        </div>
      </header>

      {/* Bookings Table */}
      <div style={{
        background: "#fff",
        borderRadius: 24,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: "700", color: "#1e293b", fontSize: 15 }}>All Genesis Bookings</span>
          {isSyncing && <span style={{ fontSize: 12, color: "#64748b" }}>🔄 Syncing with Supabase...</span>}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>REF #</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>ROUTE</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>PASSENGERS</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>SEATS</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>AMOUNT</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>TRAVEL DATE</th>
              <th style={{ padding: "16px 24px", fontSize: 12, fontWeight: "700", color: "#64748b" }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                  {isSyncing ? "Syncing data..." : "No bookings found in database."}
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: "700", color: "#1e293b" }}>{b.id}</td>
                  <td style={{ padding: "16px 24px", fontSize: 13, color: "#334155", fontWeight: "500" }}>
                    {b.from} ↔ {b.to}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontSize: 13, fontWeight: "600", color: "#334155" }}>{b.passengers[0]?.name}</div>
                    {b.passengers.length > 1 && (
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>+{b.passengers.length - 1} more passengers</div>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: 13, color: "#475569", fontWeight: "700" }}>
                    {b.seats.join(", ")}
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: 13, fontWeight: "700", color: "#0f172a" }}>
                    {b.currency} {(b.totalAmount || b.total).toFixed(2)}
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: 13, color: "#64748b" }}>
                    {new Date(b.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: "800",
                      padding: "4px 10px",
                      borderRadius: 100,
                      background: "#dcfce7",
                      color: "#16a34a"
                    }}>PAID</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Border Control Manifesto Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15,23,42,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 24,
            width: "100%",
            maxWidth: 700,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: "800", color: "#0f172a", margin: 0 }}>Border Passenger Manifesto</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#64748b" }}
              >
                ×
              </button>
            </div>

            {/* Selection Filters */}
            <div style={{ padding: "24px 32px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: "800", color: "#475569", marginBottom: 6 }}>SELECT COACH</label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, background: "#fff", fontWeight: "600" }}
                >
                  {fleet.map((bus) => (
                    <option key={bus.id} value={bus.id}>{bus.reg} - {bus.class} ({bus.model})</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: "800", color: "#475569", marginBottom: 6 }}>TRAVEL DATE</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, fontWeight: "600" }}
                />
              </div>
            </div>

            {/* Manifesto Preview Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
              {/* This is the printable area container */}
              <div id="manifesto-print-area" style={{ background: "#fff", color: "#000" }}>
                {/* Print Heading (Standard Customs Format) */}
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: "900", color: "#000", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                    Genesis Bus Company
                  </h2>
                  <h3 style={{ fontSize: 14, fontWeight: "800", color: "#111", margin: "4px 0 0", textTransform: "uppercase" }}>
                    Official Passenger Manifesto
                  </h3>
                  <div style={{ fontSize: 10, color: "#333", marginTop: 4, fontStyle: "italic" }}>
                    Immigration & Border Control Clearance Copy
                  </div>
                </div>

                {/* Grid Metadata */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 12, border: "1px solid #000" }}>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #000" }}>
                      <td style={{ padding: "6px 10px", fontWeight: "bold", background: "#f1f5f9", width: "18%" }}>Vehicle Reg:</td>
                      <td style={{ padding: "6px 10px", width: "32%" }}>{selectedBus?.reg}</td>
                      <td style={{ padding: "6px 10px", fontWeight: "bold", background: "#f1f5f9", width: "18%" }}>Travel Date:</td>
                      <td style={{ padding: "6px 10px", width: "32%" }}>{selectedDate}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #000" }}>
                      <td style={{ padding: "6px 10px", fontWeight: "bold", background: "#f1f5f9" }}>Route:</td>
                      <td style={{ padding: "6px 10px" }}>
                        {manifestoBookings[0]?.from || "N/A"} to {manifestoBookings[0]?.to || "N/A"}
                      </td>
                      <td style={{ padding: "6px 10px", fontWeight: "bold", background: "#f1f5f9" }}>Dep. Time:</td>
                      <td style={{ padding: "6px 10px" }}>{manifestoBookings[0]?.departureTime || "N/A"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 10px", fontWeight: "bold", background: "#f1f5f9" }}>Service Class:</td>
                      <td style={{ padding: "6px 10px" }}>{selectedBus?.class}</td>
                      <td style={{ padding: "6px 10px", fontWeight: "bold", background: "#f1f5f9" }}>Total Seats:</td>
                      <td style={{ padding: "6px 10px" }}>{manifestoPassengers.length} / {selectedBus?.capacity}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Passenger list */}
                {manifestoPassengers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", border: "1px dashed #cbd5e1", borderRadius: 12 }}>
                    No passengers booked on this vehicle for the selected date.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, border: "1px solid #000" }}>
                    <thead>
                      <tr style={{ background: "#f1f5f9", borderBottom: "2px solid #000", textAlign: "left" }}>
                        <th style={{ padding: "8px 12px", borderRight: "1px solid #000", width: "8%" }}>#</th>
                        <th style={{ padding: "8px 12px", borderRight: "1px solid #000", width: "12%" }}>SEAT</th>
                        <th style={{ padding: "8px 12px", borderRight: "1px solid #000", width: "40%" }}>PASSENGER FULL NAME</th>
                        <th style={{ padding: "8px 12px", borderRight: "1px solid #000", width: "25%" }}>PASSPORT / ID NUMBER</th>
                        <th style={{ padding: "8px 12px", width: "15%" }}>TICKET REF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manifestoPassengers.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #000" }}>
                          <td style={{ padding: "8px 12px", borderRight: "1px solid #000" }}>{idx + 1}</td>
                          <td style={{ padding: "8px 12px", borderRight: "1px solid #000", fontWeight: "bold" }}>{p.seat}</td>
                          <td style={{ padding: "8px 12px", borderRight: "1px solid #000", textTransform: "uppercase" }}>{p.name}</td>
                          <td style={{ padding: "8px 12px", borderRight: "1px solid #000" }}>{p.passport}</td>
                          <td style={{ padding: "8px 12px" }}>{p.bookingId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Border signatures */}
                {manifestoPassengers.length > 0 && (
                  <div className="no-break" style={{ marginTop: 40, display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <div style={{ width: "45%" }}>
                      <div style={{ height: 40, borderBottom: "1px solid #000" }}></div>
                      <p style={{ marginTop: 6, fontWeight: "600", color: "#333", textAlign: "center" }}>
                        Conductor / Driver's Signature
                      </p>
                    </div>
                    <div style={{ width: "45%" }}>
                      <div style={{ height: 40, borderBottom: "1px solid #000" }}></div>
                      <p style={{ marginTop: 6, fontWeight: "600", color: "#333", textAlign: "center" }}>
                        Border Immigration Official
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: "20px 32px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#475569",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
              <button
                disabled={manifestoPassengers.length === 0}
                onClick={handlePrint}
                style={{
                  padding: "10px 24px",
                  borderRadius: 10,
                  border: "none",
                  background: manifestoPassengers.length === 0 ? "#cbd5e1" : "#121212",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "700",
                  cursor: manifestoPassengers.length === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                🖨️ Print Manifesto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
