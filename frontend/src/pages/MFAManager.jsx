import { useState, useEffect } from 'react';
import { BackendService } from '../services/backend';
import { decodeToken } from '../utils/auth';

export default function MFAManager() {
  const [qrCode, setQrCode] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMfaStatus = async () => {
      const service = new BackendService();
      const username = decodeToken().username;
      const res = await service.post('/login', { username });

      setMfaEnabled(res.mfaRequired);
      setLoading(false);
    };

    checkMfaStatus();
  }, []);

  const enableMFA = async () => {
    const service = new BackendService();
    const username = decodeToken().username;
    const res = await service.post('/enable-mfa', { username });

    setQrCode(res.qrCode);
  };

  const verifyOTP = async () => {
    const service = new BackendService();
    const username = decodeToken().username;
    const res = await service.post('/verify-mfa', { username, token: otp });

    setErrorMessage(res.success ? 'MFA enabled!' : 'Invalid OTP.');
    if (res.success) {
      setMfaEnabled(true);
    }
  };

  const disableMFA = async () => {
    const service = new BackendService();
    const username = decodeToken().username;
    const res = await service.post('/disable-mfa', { username });

    if (res.success) {
      setMfaEnabled(false);
      setErrorMessage('MFA disabled!');
    } else {
      setErrorMessage('Failed to disable MFA.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>MFA Settings</h2>
      {mfaEnabled ? (
        <div>
          <button onClick={disableMFA}>Disable MFA</button>
        </div>
      ) : (
        <div>
          <h2>Enable OTP MFA</h2>
          <button onClick={enableMFA}>Generate QR Code</button>
          {qrCode && <img src={qrCode} alt="Scan QR Code" />}
          <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <button onClick={verifyOTP}>Verify</button>
        </div>
      )}
      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
}
