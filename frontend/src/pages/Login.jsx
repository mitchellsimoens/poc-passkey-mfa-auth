import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useNavigate } from 'react-router-dom';
import service from '../services/backend';

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
      const { options } = await service.post('/login', { username, password, otp });

      if (options) {
        const response = await startAuthentication(options);

        await service.post('/login/verify', { username, response, otp });

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
