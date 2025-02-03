import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import PasskeyManager from './pages/PasskeyManager';
import MFAManager from './pages/MFAManager';
import SecurityDashboard from './pages/SecurityDashboard';
import Login from './pages/Login';
import { startTokenRefreshInterval } from './utils/auth';
import './App.css';

export default function App() {
  useEffect(() => {
    startTokenRefreshInterval(); // Start token refresh when app loads
  }, []);

  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<h1>Welcome to Secure Login</h1>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Require Authentication) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/passkey-manager" element={<PasskeyManager />} />
          <Route path="/mfa-manager" element={<MFAManager />} />
          <Route path="/security-dashboard" element={<SecurityDashboard />} />
        </Route>
      </Routes>
    </>
  );
}
