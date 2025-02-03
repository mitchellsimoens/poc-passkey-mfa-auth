import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { BackendService } from '../services/backend';
import { decodeToken } from '../utils/auth';

export default function PasskeySetup() {
  const [passkeyName, setPasskeyName] = useState('');
  const [message, setMessage] = useState('');

  const registerPasskey = async () => {
    const service = new BackendService();
    const username = decodeToken().username;
    const options = await service.get('/register-passkey/options', { username });
    const response = await startRegistration({ optionsJSON: options });
    const res = await service.post('/register-passkey', { username, response, passkeyName });

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
