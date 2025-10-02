import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "../contexts/AuthProvider";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import LandingPage from "../components/LandingPage";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import Dashboard from "../pages/Dashboard";
import StartSession from "../components/StartSession";
import Record from "../pages/Record";

function Pages() {
  const navigate = useNavigate();

  return (
    <AuthProvider navigate={navigate}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session/new"
          element={
            <ProtectedRoute>
              <StartSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/record/:id"
          element={
            <ProtectedRoute>
              <Record />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default Pages;