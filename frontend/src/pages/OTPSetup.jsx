import { useState } from 'react';
import { decodeToken } from '../utils/auth';

const API_URL = 'http://localhost:3000';

export default function OTPSetup() {
  const [qrCode, setQrCode] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const enableMFA = async () => {
    const username = decodeToken().username;
    const res = await fetch(`${API_URL}/enable-mfa`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ username }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());

    setQrCode(res.qrCode);
  };

  const verifyOTP = async () => {
    const username = decodeToken().username;
    const res = await fetch(`${API_URL}/verify-mfa`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ username, token: otp }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json());

    setMessage(res.success ? 'MFA enabled!' : 'Invalid OTP.');
  };

  return (
    <div>
      <h2>Enable OTP MFA</h2>
      <button onClick={enableMFA}>Generate QR Code</button>
      {qrCode && <img src={qrCode} alt="Scan QR Code" />}
      <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button onClick={verifyOTP}>Verify</button>
      <p>{message}</p>
    </div>
  );
}
