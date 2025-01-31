import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

export default function PasskeyManager() {
    const [username, setUsername] = useState('');
    const [passkeys, setPasskeys] = useState([]);

    useEffect(() => {
        if (username) fetchPasskeys();
    }, [username]);

    const fetchPasskeys = async () => {
        const res = await fetch(`${API_URL}/passkeys?username=${username}`).then(res => res.json());
        setPasskeys(res.passkeys || []);
    };

    const removePasskey = async (credentialId) => {
        await fetch(`${API_URL}/remove-passkey`, {
            method: 'POST',
            body: JSON.stringify({ username, credentialId }),
            headers: { 'Content-Type': 'application/json' }
        });

        fetchPasskeys();
    };

    return (
        <div>
            <h2>Manage Passkeys</h2>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <ul>
                {passkeys.map((key, index) => (
                    <li key={index}>
                        {key.name || 'Unnamed'} ({key.id}) <button onClick={() => removePasskey(key.id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
