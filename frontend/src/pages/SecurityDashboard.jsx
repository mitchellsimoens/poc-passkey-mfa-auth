import { useCallback, useEffect, useState } from 'react';
import { decodeToken } from '../utils/auth';

const API_URL = 'http://localhost:3000';

export default function SecurityDashboard() {
  const [logins, setLogins] = useState([]);
  const [trustedDevices, setTrustedDevices] = useState([]);
  const username = decodeToken().username;

  const fetchSecurityData = useCallback(async () => {
    const loginsRes = await fetch(`${API_URL}/login-history?username=${username}`, { credentials: 'include' }).then(
      (res) => res.json(),
    );
    const devicesRes = await fetch(`${API_URL}/trusted-devices?username=${username}`, { credentials: 'include' }).then(
      (res) => res.json(),
    );

    setLogins(loginsRes || []);
    setTrustedDevices(devicesRes || []);
  }, [username]);

  useEffect(() => {
    if (username) fetchSecurityData();
  }, [username, fetchSecurityData]);

  const removeTrustedDevice = async (deviceId) => {
    await fetch(`${API_URL}/remove-trusted-device`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ username, deviceId }),
      headers: { 'Content-Type': 'application/json' },
    });

    fetchSecurityData();
  };

  return (
    <div>
      <h2>Security Dashboard</h2>
      <button onClick={fetchSecurityData}>Fetch Security Data</button>

      <h3>Recent Logins</h3>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>IP Address</th>
            <th>Device</th>
            <th>Browser</th>
            <th>OS</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logins.map((log, index) => (
            <tr key={index}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.ip}</td>
              <td>{log.device}</td>
              <td>{log.browser}</td>
              <td>{log.os}</td>
              <td style={{ color: log.success ? 'green' : 'red' }}>{log.success ? 'Success' : 'Failed'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Trusted Devices</h3>
      <ul>
        {trustedDevices.length === 0 ? (
          <li>No trusted devices found</li>
        ) : (
          trustedDevices.map((device, index) => (
            <li key={index}>
              {device} <button onClick={() => removeTrustedDevice(device)}>Remove</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
