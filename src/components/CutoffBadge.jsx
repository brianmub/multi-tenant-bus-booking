export default function CutoffBadge({ statusInfo }) {
  if (!statusInfo) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "100px",
        background: statusInfo.bg,
        color: statusInfo.color,
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "0.5px",
        border: `1px solid ${statusInfo.color}33`,
        textTransform: "uppercase"
      }}
    >
      <span style={{ 
        width: 6, 
        height: 6, 
        borderRadius: "50%", 
        background: statusInfo.color, 
        marginRight: 6,
        display: "inline-block",
        animation: statusInfo.status === "CLOSING_SOON" ? "pulse 1.5s infinite" : "none"
      }} />
      {statusInfo.label}

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
