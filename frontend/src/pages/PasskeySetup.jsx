import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';

const API_URL = 'http://localhost:3000';

export default function PasskeySetup() {
  const [username, setUsername] = useState('');
  const [passkeyName, setPasskeyName] = useState('');
  const [message, setMessage] = useState('');

  const registerPasskey = async () => {
    const options = await fetch(`${API_URL}/register-passkey`, {
      method: 'POST',
      body: JSON.stringify({ username, passkeyName }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());

    const response = await startRegistration(options);

    const res = await fetch(`${API_URL}/register-passkey`, {
      method: 'POST',
      body: JSON.stringify({ username, response, passkeyName }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());

    if (res.success) {
      setMessage('Passkey registered successfully!');
    } else {
      setMessage(res.error || 'Passkey registration failed.');
    }
  };

  return (
    <div>
      <h2>Setup Passkey</h2>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input
        type="text"
        placeholder="Passkey Name (e.g., Work Laptop)"
        value={passkeyName}
        onChange={(e) => setPasskeyName(e.target.value)}
      />
      <button onClick={registerPasskey}>Register Passkey</button>
      <p>{message}</p>
    </div>
  );
}
