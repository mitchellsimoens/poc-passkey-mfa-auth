import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { decodeToken } from '../utils/auth';

const API_URL = 'http://localhost:3000';

export default function PasskeySetup() {
  const [passkeyName, setPasskeyName] = useState('');
  const [message, setMessage] = useState('');

  const registerPasskey = async () => {
    const username = decodeToken().username;
    const options = await fetch(`${API_URL}/register-passkey/options?username=${username}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());

    const response = await startRegistration({ optionsJSON: options });

    const res = await fetch(`${API_URL}/register-passkey`, {
      method: 'POST',
      credentials: 'include',
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
