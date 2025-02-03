import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import { trackLogin } from './shared';
import { getCollection } from '../../db';
import { getWebAuthnOptions } from '../../auth-utils';

const frontendUrl = 'http://localhost:5173';

const baseCookieOptions = {
  secure: new URL(frontendUrl).protocol === 'https:',
  sameSite: 'Lax', // Changed from Strict for development
  path: '/', // Add explicit path
  domain: process.env.COOKIE_DOMAIN || new URL(frontendUrl).hostname,
  maxAge: 900,
};

const generateTokensFn = (fastify) => (username) => ({
  accessToken: fastify.jwt.sign({ username }, { expiresIn: '15m' }),
  refreshToken: fastify.jwt.sign({ username }, { expiresIn: '7d' }),
});

// **Login second step**
export const loginSecondStep = async (fastify) => {
  const users = await getCollection('users');
  const generateTokens = generateTokensFn(fastify);

  fastify.post('/login/verify', async (req, reply) => {
    const { username, password, passkey, otp, backupCode } = req.body;
    const user = await users.findOne({ username });
    const isPasswordValid = password && (await bcrypt.compare(password, user.password));

    // passkey is present, login is passkey
    if (passkey) {
      // Passkey authentication
      const credential = user.credentials.find((cred) => cred.id === passkey.id);

      if (!credential) {
        return reply.code(400).send({ error: 'Invalid credential' });
      }

      const currentOptions = await getWebAuthnOptions(user);

      const verification = await verifyAuthenticationResponse({
        response: passkey,
        expectedOrigin: frontendUrl,
        expectedChallenge: currentOptions.challenge,
        expectedRPID: new URL(frontendUrl).hostname,
        credential: {
          ...credential,
          publicKey: Uint8Array.fromBase64(credential.publicKey),
        },
      });

      if (!verification.verified) {
        return reply.code(400).send({ error: 'Authentication failed' });
      }

      credential.counter = verification.authenticationInfo.newCounter;

      await users.updateOne({ username }, { $set: { credentials: user.credentials } });
    }
    // no passkey but has otp and use is setup for otp
    // password still needs to be valid
    else if (otp && user.otpSecret) {
      if (!isPasswordValid) {
        return reply.code(400).send({ error: 'Invalid credentials' });
      }

      // Traditional MFA/OTP authentication
      const isOtpValid = speakeasy.totp.verify({
        secret: user.otpSecret,
        encoding: 'base32',
        token: otp,
      });

      const isBackupCodeValid = user.backupCodes?.includes(backupCode);

      if (!isOtpValid && !isBackupCodeValid) {
        return reply.code(400).send({ error: 'Invalid OTP or backup code' });
      }

      if (isBackupCodeValid) {
        await users.updateOne({ username }, { $pull: { backupCodes: backupCode } });
      }
    }
    // no passkey or otp, just username/password
    else if (!isPasswordValid) {
      return reply.code(400).send({ error: 'Invalid credentials' });
    }

    await trackLogin(username, req, true);

    const { accessToken, refreshToken } = generateTokens(username);

    await users.updateOne({ username }, { $set: { refreshToken } });

    reply
      .setCookie('token', accessToken, { ...baseCookieOptions, maxAge: 900 })
      .setCookie('refreshToken', refreshToken, { ...baseCookieOptions, maxAge: 604800 })
      .send({ success: true });
  });
};
