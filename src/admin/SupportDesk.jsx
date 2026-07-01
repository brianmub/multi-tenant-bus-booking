import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

export default function SupportDesk() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setTickets(data);
    } catch (err) {
      console.error("Failed to load tickets:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      
      // Update local state
      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error("Failed to update status:", err.message);
      alert("Failed to update status");
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 24, padding: 30, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b", fontWeight: "800" }}>Customer Support Desk</h2>
        <button 
          onClick={fetchTickets}
          style={{ padding: "8px 16px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontWeight: "700" }}
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <p style={{ color: "#64748b" }}>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p style={{ color: "#64748b" }}>No support tickets found. Great job!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tickets.map((ticket) => (
            <div key={ticket.id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: "800", color: "#0f172a" }}>{ticket.issue_type}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{new Date(ticket.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Ticket ID: {ticket.id.split("-")[0]}...</div>
                </div>
                
                <select 
                  value={ticket.status}
                  onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: "800",
                    fontSize: 12,
                    cursor: "pointer",
                    outline: "none",
                    background: ticket.status === "RESOLVED" ? "#dcfce7" : ticket.status === "IN PROGRESS" ? "#fef08a" : "#fee2e2",
                    color: ticket.status === "RESOLVED" ? "#166534" : ticket.status === "IN PROGRESS" ? "#854d0e" : "#991b1b"
                  }}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>
              <div style={{ fontSize: 14, color: "#334155", background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                {ticket.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
