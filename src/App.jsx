import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TenantProvider } from "./tenants/useTenant";
import { CurrencyProvider } from "./hooks/useCurrency";
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import ResultsScreen from "./screens/ResultsScreen";
import SeatMapScreen from "./screens/SeatMapScreen";
import PassengerScreen from "./screens/PassengerScreen";
import PaymentScreen from "./screens/PaymentScreen";
import ConfirmationScreen from "./screens/ConfirmationScreen";
import BookingsScreen from "./screens/BookingsScreen";

const appMode = import.meta.env.VITE_APP_MODE || "customer";

import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import BookingsLog from "./admin/BookingsLog";
import FleetStatus from "./admin/FleetStatus";
import FleetMap from "./admin/FleetMap";

export default function App() {
  if (appMode === "admin") {
    return (
      <TenantProvider>
        <BrowserRouter>
          <AdminLayout>
            <Routes>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/bookings" element={<BookingsLog />} />
              <Route path="/admin/controls" element={<AdminDashboard />} />
              <Route path="/admin/fleet" element={<FleetStatus />} />
              <Route path="/admin/map" element={<FleetMap />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </AdminLayout>
        </BrowserRouter>
      </TenantProvider>
    );
  }

  return (
    <TenantProvider>
      <CurrencyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/splash" replace />} />
            <Route path="/splash" element={<SplashScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/results" element={<ResultsScreen />} />
            <Route path="/seats/:busId" element={<SeatMapScreen />} />
            <Route path="/passenger" element={<PassengerScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/confirmation" element={<ConfirmationScreen />} />
            <Route path="/bookings" element={<BookingsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="*" element={<Navigate to="/splash" replace />} />
          </Routes>
        </BrowserRouter>
      </CurrencyProvider>
    </TenantProvider>
  );
}
