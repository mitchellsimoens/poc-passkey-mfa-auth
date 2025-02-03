import { useNavigate } from 'react-router-dom';
import { BackendService } from '../../services/backend';
import './LogoutButton.css';

export default function LogoutButton() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const service = new BackendService();

      await service.post('/logout');
    } catch {
      // Fallback: manually clear the cookie if server request fails
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    navigate('/');
  };

  return (
    <div className="logout-button" onClick={logout}>
      Logout
    </div>
  );
}
