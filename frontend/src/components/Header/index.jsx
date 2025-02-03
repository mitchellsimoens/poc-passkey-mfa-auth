import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import LogoutButton from '../LogoutButton';
import './Header.css';

const Header = () => {
  const [cookies] = useCookies(['token']);
  const isAuthenticated = Boolean(cookies.token);

  return (
    <header>
      <nav>
        <div className="nav-left">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <Link to="/passkey-manager">Manage Passkeys</Link>
                </li>
                <li>
                  <Link to="/mfa-manager">Manage MFA</Link>
                </li>
                <li>
                  <Link to="/security-dashboard">Security Dashboard</Link>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="nav-right">
          {isAuthenticated && <LogoutButton />}
          {!isAuthenticated && (
            <ul>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
