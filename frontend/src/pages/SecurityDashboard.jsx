import { useCallback, useEffect, useState } from 'react';
import service from '../services/backend';
import { decodeToken } from '../utils/auth';

export default function SecurityDashboard() {
  const [logins, setLogins] = useState([]);
  const [trustedDevices, setTrustedDevices] = useState([]);
  const username = decodeToken().username;

  const fetchSecurityData = useCallback(async () => {
    const loginsRes = await service.get('/login-history', { username });
    const devicesRes = await service.get('/trusted-devices', { username });

    setLogins(loginsRes || []);
    setTrustedDevices(devicesRes || []);
  }, [username]);

  useEffect(() => {
    if (username) fetchSecurityData();
  }, [username, fetchSecurityData]);

  const removeTrustedDevice = async (deviceId) => {
    await service.post('/remove-trusted-device', { username, deviceId });

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
