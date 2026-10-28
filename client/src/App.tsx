import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import { AdminRoute, ProtectedRoute, PublicRoute, UserRoute } from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import GaragePage from './pages/GaragePage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import ServicesPage from './pages/ServicesPage';
import OdometerPage from './pages/OdometerPage';
import DocumentsPage from './pages/DocumentsPage';
import InsurancePage from './pages/InsurancePage';
import WarrantiesPage from './pages/WarrantiesPage';
import LicencePage from './pages/LicencePage';
import TyreBatteryPage from './pages/TyreBatteryPage';
import ExpensesPage from './pages/ExpensesPage';
import NearbyPage from './pages/NearbyPage';
import CalendarPage from './pages/CalendarPage';
import EmergencyPage from './pages/EmergencyPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';

function HomePage() {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> : <DashboardPage />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PublicRoute>
            <VerifyOtpPage />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route element={<UserRoute />}>
          <Route path="/garage" element={<GaragePage />} />
          <Route path="/garage/:id" element={<VehicleDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/odometer" element={<OdometerPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/insurance" element={<InsurancePage />} />
          <Route path="/warranties" element={<WarrantiesPage />} />
          <Route path="/licence" element={<LicencePage />} />
          <Route path="/tyre-battery" element={<TyreBatteryPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/nearby" element={<NearbyPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
