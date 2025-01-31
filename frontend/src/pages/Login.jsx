import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';

const API_URL = 'http://localhost:3000';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  const login = async () => {
    const { options } = await fetch(`${API_URL}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());

    const response = await startAuthentication(options);

    await fetch(`${API_URL}/login/verify`, {
      method: 'POST',
      body: JSON.stringify({ username, response, otp }),
      headers: { 'Content-Type': 'application/json' },
    });

    alert('Login successful');
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="text" placeholder="OTP (if required)" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );
}
