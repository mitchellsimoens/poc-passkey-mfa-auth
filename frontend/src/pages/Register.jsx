import { useState } from 'react';

const API_URL = 'http://localhost:3000';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const register = async () => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());

    if (res.success) {
      setMessage('Registration successful! Now register a passkey.');
    } else {
      setMessage(res.error || 'Registration failed.');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={register}>Register</button>
      <p>{message}</p>
    </div>
  );
}
