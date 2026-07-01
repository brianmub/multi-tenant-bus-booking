import { useTenant } from "../tenants/useTenant";
import { Link, useLocation } from "react-router-dom";

export default function AdminLayout({ children }) {
  const tenant = useTenant();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: "📊" },
    { label: "Bookings", path: "/admin/bookings", icon: "🎟️" },
    { label: "Fleet Status", path: "/admin/fleet", icon: "🚌" },
    { label: "Live Fleet Map", path: "/admin/map", icon: "🗺️" },
    { label: "Support Desk", path: "/admin/support", icon: "🎧" },
    { label: "Operational Controls", path: "/admin/controls", icon: "⚙️" },
    { label: "Settings", path: "/admin/settings", icon: "🔧" },
  ];

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#f1f5f9",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Sidebar */}
      <div style={{
        width: 280,
        background: "#1e293b",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        height: "100vh"
      }}>
        <div style={{
          padding: "32px 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(0,0,0,0.2)"
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: tenant.primaryColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: "900"
          }}>
            {tenant.logo}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: "800", letterSpacing: "-0.02em" }}>{tenant.name}</div>
            <div style={{ fontSize: 10, opacity: 0.6, fontWeight: "700" }}>STAFF PORTAL</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "24px 12px" }}>
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 12,
                color: location.pathname === item.path ? "#fff" : "#94a3b8",
                background: location.pathname === item.path ? "rgba(255,255,255,0.1)" : "transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 4,
                transition: "0.2s"
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#475569" }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: "700" }}>Admin User</div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>Super Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: 280, flex: 1, padding: 40 }}>
        {children}
      </div>
    </div>
  );
}
