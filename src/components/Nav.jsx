import { useLocation, useNavigate } from "react-router-dom";
import { useTenant } from "../tenants/useTenant";
import { useLanguage } from "../context/LanguageContext";

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const tenant = useTenant();
  const { t } = useLanguage();

  const tabs = [
    { id: "home", label: t("nav_search"), path: "/home", icon: "🔍" },
    { id: "bookings", label: t("nav_tickets"), path: "/bookings", icon: "🎟️" },
    { id: "profile", label: t("nav_profile"), path: "/profile", icon: "👤" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 420,
        height: 70,
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        paddingBottom: "env(safe-area-inset-bottom)",
        zIndex: 100,
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: isActive ? tenant.primaryColor : "#666",
              cursor: "pointer",
              transition: "0.2s",
              opacity: isActive ? 1 : 0.6,
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
