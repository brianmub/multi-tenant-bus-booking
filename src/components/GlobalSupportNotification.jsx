import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useUser } from "../context/UserContext";

export default function GlobalSupportNotification() {
  const { user } = useUser();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`support-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "support_tickets",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const oldStatus = payload.old?.status;
          const newStatus = payload.new?.status;

          if (oldStatus !== newStatus) {
            setNotification({
              id: payload.new.id,
              type: payload.new.issue_type,
              status: newStatus
            });
            
            // Auto dismiss after 6 seconds
            setTimeout(() => {
              setNotification(null);
            }, 6000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (!notification) return null;

  return (
    <div style={{
      position: "fixed",
      top: 20,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#1e293b",
      color: "#fff",
      padding: "16px 24px",
      borderRadius: 16,
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontFamily: "'Inter', sans-serif",
      minWidth: 320,
      animation: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      <div style={{ fontSize: 24 }}>
        {notification.status === "RESOLVED" ? "✅" : "🚧"}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: "800", letterSpacing: "0.5px" }}>
          TICKET UPDATE
        </div>
        <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4, lineHeight: "1.4" }}>
          Your {notification.type} report has been marked as <strong>{notification.status}</strong> by our support team.
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
