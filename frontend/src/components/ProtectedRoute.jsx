import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    const isAuthenticated = document.cookie.includes('token='); // Check if JWT token exists

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
