import { useCookies } from 'react-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { BackendService } from '../../services/backend';
import './LogoutButton.css';

export default function LogoutButton() {
  const [_a, _b, removeCookie] = useCookies(['name']);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const service = new BackendService();

      await service.post('/logout');
    } catch {
      // Fallback: manually clear the cookie if server request fails
      removeCookie('token');
      removeCookie('refreshToken');
    }

    navigate('/');
  };

  return (
    <Link
      className="logout-button"
      onClick={(e) => {
        e.preventDefault();
        logout();
      }}
    >
      Logout
    </Link>
  );
}
