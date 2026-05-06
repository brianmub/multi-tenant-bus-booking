import { useTenant } from "../tenants/useTenant";

export default function LogoBox({ size = 50, shadow = true }) {
  const tenant = useTenant();

  const borderRadius = 
    tenant.logoType === "pill" ? size / 2 :
    tenant.logoType === "circle" ? "50%" :
    "12px";

  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#fff",
        borderRadius: borderRadius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        fontWeight: "900",
        color: tenant.primaryColor,
        boxShadow: shadow ? "0 8px 24px rgba(0,0,0,0.12)" : "none",
        flexShrink: 0,
        overflow: "hidden"
      }}
    >
      {tenant.name.charAt(0)}
    </div>
  );
}
