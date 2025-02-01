import { useNavigate } from 'react-router-dom';
import service from '../services/backend';

export default function LogoutButton() {
  const navigate = useNavigate();

  const logout = async () => {
    await service.post('/logout');

    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    navigate('/');
  };

  return <button onClick={logout}>Logout</button>;
}
