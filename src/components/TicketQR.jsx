import { useTenant } from "../tenants/useTenant";

export default function TicketQR({ value, size = 120 }) {
  const tenant = useTenant();
  
  return (
    <div style={{
      width: size,
      height: size,
      background: "#fff",
      padding: 8,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      border: "1px solid #f1f5f9"
    }}>
      {/* Stylized SVG QR Code Pattern */}
      <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="30" height="30" fill={tenant.primaryColor} />
        <rect x="7" y="7" width="16" height="16" fill="white" />
        <rect x="11" y="11" width="8" height="8" fill={tenant.primaryColor} />
        
        <rect x="70" y="0" width="30" height="30" fill={tenant.primaryColor} />
        <rect x="77" y="7" width="16" height="16" fill="white" />
        <rect x="81" y="11" width="8" height="8" fill={tenant.primaryColor} />
        
        <rect x="0" y="70" width="30" height="30" fill={tenant.primaryColor} />
        <rect x="7" y="77" width="16" height="16" fill="white" />
        <rect x="11" y="81" width="8" height="8" fill={tenant.primaryColor} />
        
        {/* Random dots to simulate QR density */}
        {[...Array(20)].map((_, i) => (
          <rect 
            key={i} 
            x={35 + (Math.random() * 30)} 
            y={35 + (Math.random() * 30)} 
            width="4" 
            height="4" 
            fill="#1e293b" 
          />
        ))}
        
        <rect x="40" y="0" width="10" height="10" fill="#1e293b" />
        <rect x="0" y="40" width="10" height="10" fill="#1e293b" />
        <rect x="90" y="90" width="10" height="10" fill="#1e293b" />
        <rect x="80" y="70" width="8" height="8" fill="#1e293b" />
      </svg>
      
      {/* Center Branding Icon */}
      <div style={{
        position: "absolute",
        width: size / 4,
        height: size / 4,
        background: tenant.primaryColor,
        borderRadius: 4,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size / 8,
        fontWeight: "900",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        {tenant.logo}
      </div>
    </div>
  );
}
