import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000';

export default function SecurityDashboard() {
    const [username, setUsername] = useState('');
    const [logins, setLogins] = useState([]);
    const [trustedDevices, setTrustedDevices] = useState([]);

    useEffect(() => {
        if (username) fetchSecurityData();
    }, [username]);

    const fetchSecurityData = async () => {
        const res = await fetch(`${API_URL}/security?username=${username}`).then(res => res.json());
        setLogins(res.logins || []);
        setTrustedDevices(res.trustedDevices || []);
    };

    const removeTrustedDevice = async (deviceId) => {
        await fetch(`${API_URL}/remove-trusted-device`, {
            method: 'POST',
            body: JSON.stringify({ username, deviceId }),
            headers: { 'Content-Type': 'application/json' }
        });

        fetchSecurityData();
    };

    return (
        <div>
            <h2>Security Dashboard</h2>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <h3>Recent Logins</h3>
            <ul>{logins.map((log, index) => <li key={index}>{log.device} from {log.ip} at {log.timestamp}</li>)}</ul>
            <h3>Trusted Devices</h3>
            <ul>
                {trustedDevices.map((device, index) => (
                    <li key={index}>{device} <button onClick={() => removeTrustedDevice(device)}>Remove</button></li>
                ))}
            </ul>
        </div>
    );
}
