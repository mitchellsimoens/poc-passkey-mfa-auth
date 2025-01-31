import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
    const navigate = useNavigate();

    const logout = async () => {
        await fetch('http://localhost:3000/logout', { method: 'POST', credentials: 'include' });
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/login');
    };

    return <button onClick={logout}>Logout</button>;
}
