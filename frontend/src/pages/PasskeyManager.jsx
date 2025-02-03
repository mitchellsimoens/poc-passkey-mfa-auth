import { useCallback, useEffect, useState } from 'react';
import PasskeySetup from '../components/PasskeySetup';
import { BackendService } from '../services/backend';
import { decodeToken } from '../utils/auth';

export default function PasskeyManager() {
  const [passkeys, setPasskeys] = useState([]);

  const fetchPasskeys = useCallback(async () => {
    const service = new BackendService();
    const username = decodeToken().username;
    const res = await service.get('/passkeys', { username });

    setPasskeys(res || []);
  }, []);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  const removePasskey = async (credentialId) => {
    const service = new BackendService();
    const username = decodeToken().username;

    await service.post('/remove-passkey', { username, credentialId });

    fetchPasskeys();
  };

  return (
    <div>
      <h2>Manage Passkeys</h2>

      <div className="passkey-table">
        <div className="passkey-header">
          <div>ID</div>
          <div>Name</div>
          <div>Created At</div>
          <div>Actions</div>
        </div>

        {passkeys.map((key) => (
          <div className="passkey-row" key={key.id}>
            <div>{key.id}</div>
            <div>{key.name || '<Unnamed>'}</div>
            <div>{key.createdAt}</div>
            <div>
              <button onClick={() => removePasskey(key.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <hr />

      <PasskeySetup />
    </div>
  );
}
