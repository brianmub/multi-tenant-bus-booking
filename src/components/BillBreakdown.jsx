import { useCurrency } from "../hooks/useCurrency";
import { fmtConverted } from "../utils/currency";

export default function BillBreakdown({ subtotal, seatsCount, luggageFee = 0 }) {
  const { currency } = useCurrency();
  
  const tax = subtotal * 0.15; // 15% tax
  const serviceFee = 2.00; // Flat service fee
  const total = subtotal + tax + serviceFee + luggageFee;

  return (
    <div style={{
      background: "#f8fafc",
      borderRadius: 20,
      padding: 20,
      border: "1px solid #e2e8f0"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, color: "#64748b" }}>Tickets ({seatsCount})</span>
        <span style={{ fontSize: 14, fontWeight: "600", color: "#1e293b" }}>{fmtConverted(subtotal, currency.id)}</span>
      </div>
      {luggageFee > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: "#64748b" }}>Luggage Excess Fee</span>
          <span style={{ fontSize: 14, fontWeight: "600", color: "#1e293b" }}>{fmtConverted(luggageFee, currency.id)}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, color: "#64748b" }}>Taxes & VAT</span>
        <span style={{ fontSize: 14, fontWeight: "600", color: "#1e293b" }}>{fmtConverted(tax, currency.id)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: "#64748b" }}>Service Fee</span>
        <span style={{ fontSize: 14, fontWeight: "600", color: "#1e293b" }}>{fmtConverted(serviceFee, currency.id)}</span>
      </div>
      <div style={{ height: 1, background: "#e2e8f0", marginBottom: 16 }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 16, fontWeight: "800", color: "#1e293b" }}>Total Amount</span>
        <span style={{ fontSize: 20, fontWeight: "900", color: "#1e293b" }}>{fmtConverted(total, currency.id)}</span>
      </div>
    </div>
  );
}
