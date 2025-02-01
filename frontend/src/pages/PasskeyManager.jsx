import { useCallback, useEffect, useState } from 'react';
import service from '../services/backend';
import { decodeToken } from '../utils/auth';

export default function PasskeyManager() {
  const [passkeys, setPasskeys] = useState([]);

  const fetchPasskeys = useCallback(async () => {
    const username = decodeToken().username;
    const res = await service.get('/passkeys', { username });

    setPasskeys(res || []);
  }, []);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  const removePasskey = async (credentialId) => {
    const username = decodeToken().username;

    await service.post('/remove-passkey', { username, credentialId });

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
