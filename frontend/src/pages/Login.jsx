import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';

function Step1({ username, setUsername, handleLogin }) {
  return (
    <>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <button onClick={handleLogin}>Next</button>
    </>
  );
}

Step1.propTypes = {
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
};

function Step2({ username, password, setPassword, handleUsernamePasswordLogin, handlePasskeyLogin }) {
  useEffect(() => {
    handlePasskeyLogin();
  }, [handlePasskeyLogin]);

  return (
    <>
      <input type="text" value={username} readOnly />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleUsernamePasswordLogin}>Login with Username/Password</button>
    </>
  );
}

Step2.propTypes = {
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  handleUsernamePasswordLogin: PropTypes.func.isRequired,
  handlePasskeyLogin: PropTypes.func.isRequired,
};

function Step3({ otp, setOtp, handleMfaLogin }) {
  return (
    <>
      <input type="text" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button onClick={handleMfaLogin}>Verify OTP</button>
    </>
  );
}

Step3.propTypes = {
  otp: PropTypes.string.isRequired,
  setOtp: PropTypes.func.isRequired,
  handleMfaLogin: PropTypes.func.isRequired,
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState(1);
  const [passkeyOptions, setPasskeyOptions] = useState(null);
  const navigate = useNavigate();

  const handleSuccess = useCallback(() => {
    setErrorMessage('');

    navigate('/');
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const { options, mfaRequired } = await authService.getLoginOptions(username);

      if (options) {
        setPasskeyOptions(options);

        setMfaRequired(mfaRequired ?? false);

        setStep(2); // Proceed to passkey step
      } else {
        handleSuccess();
      }
    } catch {
      setErrorMessage('Login failed. Please check your login information.');
    }
  };

  const handleUsernamePasswordLogin = async () => {
    try {
      if (mfaRequired) {
        setStep(3); // Proceed to MFA step
      } else {
        await authService.doPasswordLogin(username, password);

        handleSuccess();
      }
    } catch {
      setErrorMessage('Login failed. Please check your login information.');
    }
  };

  const handlePasskeyLogin = useCallback(async () => {
    try {
      const response = await startAuthentication({
        optionsJSON: passkeyOptions,
      });

      await authService.doPasskeyLogin(username, response);

      handleSuccess();
    } catch (error) {
      switch (error.name) {
        case 'AbortError':
        case 'NotAllowedError':
          // user aborted selecting a passkey
          break;

        default:
          setErrorMessage('Passkey login failed. Please try again.');
      }
    }
  }, [passkeyOptions, username, handleSuccess]);

  const handleMfaLogin = async () => {
    try {
      await authService.doMfaLogin(username, password, otp);

      handleSuccess();
    } catch {
      setErrorMessage('MFA verification failed. Please try again.');
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {step === 1 && <Step1 username={username} setUsername={setUsername} handleLogin={handleLogin} />}

      {step === 2 && (
        <Step2
          username={username}
          password={password}
          setPassword={setPassword}
          handleUsernamePasswordLogin={handleUsernamePasswordLogin}
          handlePasskeyLogin={handlePasskeyLogin}
        />
      )}

      {step === 3 && mfaRequired && <Step3 otp={otp} setOtp={setOtp} handleMfaLogin={handleMfaLogin} />}

      {errorMessage && <div>{errorMessage}</div>}
    </div>
  );
}
