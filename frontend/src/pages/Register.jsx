import { useState } from 'react';
import service from '../services/backend';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const register = async () => {
    const res = await service.post('/register', { username, password });

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
