import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { useUser } from "../context/UserContext";
import { supabase } from "../utils/supabaseClient";

export default function SupportScreen() {
  const tenant = useTenant();
  const navigate = useNavigate();
  const { user } = useUser();

  const [issueType, setIssueType] = useState("Delay");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("support_tickets").insert([
        {
          user_id: user?.id || null,
          issue_type: issueType,
          description: description.trim(),
          status: "OPEN"
        }
      ]);

      if (error) throw error;
      
      setIsSuccess(true);
      setDescription("");
      
      // Auto return after 3 seconds
      setTimeout(() => {
        navigate(-1);
      }, 3000);
      
    } catch (err) {
      console.error("Failed to submit support ticket:", err.message);
      alert("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      margin: "0 auto",
      minHeight: "100vh",
      background: "#f8f9fa",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        background: tenant.bgGradient,
        padding: "24px 24px 40px",
        borderRadius: "0 0 32px 32px",
        color: "#fff",
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
          <div style={{ fontSize: 20, fontWeight: "900" }}>Help & Support</div>
        </div>
      </div>

      <div style={{ padding: "0 24px", marginTop: -20 }}>
        {isSuccess ? (
          <div style={{
            background: "#fff",
            padding: 40,
            borderRadius: 24,
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: "800", color: "#1e293b", margin: "0 0 8px" }}>Ticket Submitted</h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              We've received your report. The {tenant.name} support team will review this shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: "#fff",
            padding: 24,
            borderRadius: 24,
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: 20
          }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: "800", color: "#94a3b8", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Issue Category</label>
              <select 
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 15,
                  fontWeight: "600",
                  background: "#f8fafc",
                  outline: "none"
                }}
              >
                <option value="Delay">Bus Delay / Breakdown</option>
                <option value="Luggage">Lost / Damaged Luggage</option>
                <option value="Cancellation">Trip Cancellation</option>
                <option value="Border">Border / Customs Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: "800", color: "#94a3b8", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Description</label>
              <textarea 
                required
                rows={5}
                placeholder="Please describe what happened..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 14,
                  background: "#f8fafc",
                  outline: "none",
                  resize: "vertical"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                background: tenant.primaryColor,
                color: "#121212",
                border: "none",
                padding: "16px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: "800",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: `0 8px 20px ${tenant.primaryColor}44`,
                marginTop: 8
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
