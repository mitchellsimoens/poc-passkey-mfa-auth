import { useCallback, useEffect, useState } from 'react';
import { decodeToken } from '../utils/auth';

const API_URL = 'http://localhost:3000';

export default function PasskeyManager() {
  const [passkeys, setPasskeys] = useState([]);

  const fetchPasskeys = useCallback(async () => {
    const username = decodeToken().username;
    const res = await fetch(`${API_URL}/passkeys?username=${username}`, { credentials: 'include' }).then((res) =>
      res.json(),
    );

    setPasskeys(res || []);
  }, []);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  const removePasskey = async (credentialId) => {
    const username = decodeToken().username;

    await fetch(`${API_URL}/remove-passkey`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ username, credentialId }),
      headers: { 'Content-Type': 'application/json' },
    });

    fetchPasskeys();
  };

  return (
    <div>
      <h2>Manage Passkeys</h2>
      <ul>
        {passkeys.map((key) => (
          <li key={key.id}>
            {key.name || '<Unnamed>'} ({key.id}) Created: {key.createdAt}{' '}
            <button onClick={() => removePasskey(key.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
