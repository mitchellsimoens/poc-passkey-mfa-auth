import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSuccess = () => {
    setErrorMessage('');

    navigate('/');
  };

  const login = async () => {
    try {
      const loginResponse = await fetch(`${API_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ username, password, otp }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!loginResponse.ok) {
        throw new Error('Verification failed');
      }

      const { options } = await loginResponse.json();

      if (options) {
        const response = await startAuthentication(options);

        const verifyResponse = await fetch(`${API_URL}/login/verify`, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({ username, response, otp }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!verifyResponse.ok) {
          throw new Error('Verification failed');
        }

        handleSuccess();
      } else {
        handleSuccess();
      }
    } catch {
      setErrorMessage('Login failed. Please check your login information.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="text" placeholder="OTP (if required)" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button onClick={login}>Login</button>
      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
}
