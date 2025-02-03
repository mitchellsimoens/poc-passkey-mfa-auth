import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import { trustedDevices } from './routes/login/trusted-devices/get';
import { removeTrustedDevices } from './routes/login/trusted-devices/remove';
import { loginFirstStep } from './routes/login/first-step';
import { loginHistory } from './routes/login/history';
import { logout } from './routes/login/logout';
import { loginSecondStep } from './routes/login/second-step';
import { refreshTokens } from './routes/login/refresh-tokens';
import { enableMfa } from './routes/mfa/enable';
import { verifyMfa } from './routes/mfa/verify';
import { getPasskeys } from './routes/passkey/get';
import { getPasskeyOptions } from './routes/passkey/options';
import { registerPasskey } from './routes/passkey/register';
import { removePasskey } from './routes/passkey/remove';
import { register } from './routes/register';

const fastify = Fastify({ logger: true });
const frontendUrl = 'http://localhost:5173';

fastify.register(cors, { origin: frontendUrl, credentials: true });

fastify.register(helmet);

fastify.register(cookie);

fastify.register(jwt, { secret: process.env.JWT_SECRET || 'your-secret-key' });

fastify.register(rateLimit, { max: 100, timeWindow: '10 minutes' });

await Promise.all([
  // **Register a User with Username & Password**
  register(fastify),

  // **Get Passkey Registration Options**
  getPasskeyOptions(fastify),

  // **Register a Passkey with a Creation Date**
  registerPasskey(fastify),

  // **Remove a Specific Passkey**
  removePasskey(fastify),

  // **Get List of Passkeys**
  getPasskeys(fastify),

  // **Login with Password**
  loginFirstStep(fastify),

  // **Verify Passkey Login & OTP MFA**
  loginSecondStep(fastify),

  // **Refresh Token Endpoint**
  refreshTokens(fastify),

  // **Enable MFA Endpoint**
  enableMfa(fastify),

  // **Verify MFA Code**
  verifyMfa(fastify),

  // **Login History Endpoint**
  loginHistory(fastify),

  // **Trusted Device Management**
  trustedDevices(fastify),

  // **Remove Trusted Device**
  removeTrustedDevices(fastify),

  // **Logout Endpoint**
  logout(fastify),
]);

fastify.listen({ port: 3000 }, () => console.log('Server running on http://localhost:3000'));
