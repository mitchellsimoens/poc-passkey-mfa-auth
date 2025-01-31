import { Routes, Route, Link } from 'react-router-dom';
import LogoutButton from './components/LogoutButton';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import PasskeySetup from './pages/PasskeySetup';
import PasskeyManager from './pages/PasskeyManager';
import OTPSetup from './pages/OTPSetup';
import SecurityDashboard from './pages/SecurityDashboard';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> |<Link to="/register">Register</Link> |<Link to="/passkey-setup">Passkey Setup</Link> |
        <Link to="/passkey-manager">Manage Passkeys</Link> |<Link to="/otp-setup">Enable MFA</Link> |
        <Link to="/security-dashboard">Security Dashboard</Link> |<Link to="/login">Login</Link>
        <LogoutButton />
      </nav>

      <Routes>
        <Route path="/" element={<h1>Welcome to Secure Login</h1>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (Require Authentication) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/passkey-setup" element={<PasskeySetup />} />
          <Route path="/passkey-manager" element={<PasskeyManager />} />
          <Route path="/otp-setup" element={<OTPSetup />} />
          <Route path="/security-dashboard" element={<SecurityDashboard />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
