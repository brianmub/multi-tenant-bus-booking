import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TenantProvider } from "./tenants/useTenant";
import { CurrencyProvider } from "./hooks/useCurrency";
import { UserProvider } from "./context/UserContext";
import { LanguageProvider } from "./context/LanguageContext";
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import ResultsScreen from "./screens/ResultsScreen";
import SeatMapScreen from "./screens/SeatMapScreen";
import PassengerScreen from "./screens/PassengerScreen";
import PaymentScreen from "./screens/PaymentScreen";
import ConfirmationScreen from "./screens/ConfirmationScreen";
import BookingsScreen from "./screens/BookingsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import SupportScreen from "./screens/SupportScreen";
import LiveTrackingScreen from "./screens/LiveTrackingScreen";
import ConductorScreen from "./screens/ConductorScreen";
import GlobalSupportNotification from "./components/GlobalSupportNotification";
import { syncBookingsFromDb } from "./utils/storage";

const appMode = import.meta.env.VITE_APP_MODE || "customer";

import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import BookingsLog from "./admin/BookingsLog";
import FleetStatus from "./admin/FleetStatus";
import FleetMap from "./admin/FleetMap";
import SupportDesk from "./admin/SupportDesk";

export default function App() {
  useEffect(() => {
    syncBookingsFromDb();
  }, []);

  if (appMode === "admin") {
    return (
      <UserProvider>
        <TenantProvider>
          <BrowserRouter>
            <AdminLayout>
              <Routes>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/bookings" element={<BookingsLog />} />
                <Route path="/admin/controls" element={<div style={{ padding: 24, background: "#fff", borderRadius: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}><h3>Operational Controls</h3><p>Adjust pricing cutoffs, fleet assignments, and emergency overrides.</p></div>} />
                <Route path="/admin/fleet" element={<FleetStatus />} />
                <Route path="/admin/map" element={<FleetMap />} />
                <Route path="/admin/support" element={<SupportDesk />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </AdminLayout>
          </BrowserRouter>
        </TenantProvider>
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <TenantProvider>
        <CurrencyProvider>
          <LanguageProvider>
            <GlobalSupportNotification />
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
              <Route path="/track/:id" element={<LiveTrackingScreen />} />
              <Route path="/conductor" element={<ConductorScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/support" element={<SupportScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="*" element={<Navigate to="/splash" replace />} />
              </Routes>
            </BrowserRouter>
          </LanguageProvider>
        </CurrencyProvider>
      </TenantProvider>
    </UserProvider>
  );
}
