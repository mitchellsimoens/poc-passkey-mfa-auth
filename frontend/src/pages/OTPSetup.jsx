import { useState } from 'react';
import { BackendService } from '../services/backend';
import { decodeToken } from '../utils/auth';

export default function OTPSetup() {
  const [qrCode, setQrCode] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const enableMFA = async () => {
    const service = new BackendService();
    const username = decodeToken().username;
    const res = await service.post('/enable-mfa', { username });

    setQrCode(res.qrCode);

    // TODO: handle success somehow
  };

  const verifyOTP = async () => {
    const service = new BackendService();
    const username = decodeToken().username;
    const res = await service.post('/verify-mfa', { username, token: otp });

    setErrorMessage(res.success ? 'MFA enabled!' : 'Invalid OTP.');
  };

  return (
    <div>
      <h2>Enable OTP MFA</h2>
      <button onClick={enableMFA}>Generate QR Code</button>
      {qrCode && <img src={qrCode} alt="Scan QR Code" />}
      <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button onClick={verifyOTP}>Verify</button>
      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
}
