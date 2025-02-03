import { useNavigate } from 'react-router-dom';
import service from '../services/backend';

export default function LogoutButton() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await service.post('/logout');
    } catch {
      // Fallback: manually clear the cookie if server request fails
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    navigate('/');
  };

  return <div onClick={logout}>Logout</div>;
}
