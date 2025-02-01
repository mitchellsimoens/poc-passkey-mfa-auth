import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { isoUint8Array } from '@simplewebauthn/server/helpers';
import bcrypt from 'bcrypt';
import Fastify from 'fastify';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import speakeasy from 'speakeasy';
import useragent from 'useragent';
import QRCode from 'qrcode';

const fastify = Fastify({ logger: true });
const frontendUrl = 'http://localhost:5173';
const baseCookieOptions = {
  secure: new URL(frontendUrl).protocol === 'https:',
  sameSite: 'Lax', // Changed from Strict for development
  path: '/', // Add explicit path
  domain: process.env.COOKIE_DOMAIN || new URL(frontendUrl).hostname,
  maxAge: 900,
};

fastify.register(cors, { origin: frontendUrl, credentials: true });
fastify.register(helmet);
fastify.register(cookie);
fastify.register(jwt, { secret: process.env.JWT_SECRET || 'your-secret-key' });
fastify.register(rateLimit, { max: 100, timeWindow: '10 minutes' });

const mongoClient = new MongoClient('mongodb://localhost:27017');
await mongoClient.connect();
const db = mongoClient.db('passkeyAuth');
const users = db.collection('users');
const loginAttempts = db.collection('loginAttempts');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const generateTokens = (username) => ({
  accessToken: fastify.jwt.sign({ username }, { expiresIn: '15m' }),
  refreshToken: fastify.jwt.sign({ username }, { expiresIn: '7d' }),
});

const generateChallengeForUser = (user) => isoUint8Array.fromUTF8String(user._id.toString() + user.username);

const getWebAuthnOptions = async (user) => {
  const options = await generateRegistrationOptions({
    rpID: new URL(frontendUrl).hostname,
    rpName: 'ACME Corporation', // TODO: via config/env var
    userID: isoUint8Array.fromUTF8String(user._id.toString()),
    attestationType: 'none',
    userName: user.username,
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
    },
    challenge: generateChallengeForUser(user),
    // TODO: load current passkeys
    // excludeCredentials: userPasskeys.map(passkey => ({
    //   id: passkey.id,
    //   // Optional
    //   transports: passkey.transports,
    // })),
  });

  return options;
};

// **Track Login Attempts & Alert User on New Device**
async function trackLogin(username, req, success) {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const userAgent = useragent.parse(req.headers['user-agent']);

  const loginRecord = {
    username,
    ip,
    device: userAgent.device.toString() || 'Unknown Device',
    browser: userAgent.toAgent(),
    os: userAgent.os.toString(),
    success,
    timestamp: new Date(),
  };

  await loginAttempts.insertOne(loginRecord);

  if (process.env.EMAIL_USER && success) {
    const user = await users.findOne({ username });

    if (user?.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'New Login Detected',
        text: `A new login was detected:\n\n- IP: ${ip}\n- Device: ${loginRecord.device}\n- Browser: ${loginRecord.browser}\n- OS: ${loginRecord.os}\n- Time: ${new Date().toLocaleString()}\n\nIf this was not you, please secure your account.`,
      });
    }
  }
}

// **Register a User with Username & Password**
fastify.post('/register', async (req, reply) => {
  const { username, password } = req.body;
  const userExists = await users.findOne({ username });

  if (userExists) {
    return reply.code(400).send({ error: 'User already exists' });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await users.insertOne({ username, password: hashedPassword });

  reply.send({ success: true });
});

// **Get Passkey Registration Options**
fastify.get('/register-passkey/options', async (req, reply) => {
  const { username } = req.query;

  if (!username) {
    return reply.code(400).send({ error: 'Username is required' });
  }

  const user = await users.findOne({ username });

  if (!user) {
    return reply.code(404).send({ error: 'User not found' });
  }

  const options = await getWebAuthnOptions(user);

  reply.send(options);
});

// **Register a Passkey with a Creation Date**
fastify.post('/register-passkey', async (req, reply) => {
  const { username, passkeyName, response } = req.body;
  const user = await users.findOne({ username });

  if (!user) {
    return reply.code(400).send({ error: 'User not found' });
  }

  const currentOptions = await getWebAuthnOptions(user);

  const verification = await verifyRegistrationResponse({
    response,
    expectedOrigin: frontendUrl,
    expectedChallenge: currentOptions.challenge,
    expectedRPID: currentOptions.rp.id,
  });

  if (!verification.verified) {
    return reply.code(400).send({ error: 'Passkey registration failed' });
  }

  const { registrationInfo } = verification;
  const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
  const newPasskey = {
    // Created by `generateRegistrationOptions()` in Step 1
    webAuthnUserID: currentOptions.user.id,
    // A unique identifier for the credential
    id: credential.id,
    // The public key bytes, used for subsequent authentication signature verification
    publicKey: credential.publicKey.toBase64(),
    // The number of times the authenticator has been used on this site so far
    counter: credential.counter,
    // How the browser can talk with this credential's authenticator
    transports: credential.transports,
    // Whether the passkey is single-device or multi-device
    deviceType: credentialDeviceType,
    // Whether the passkey has been backed up in some way
    backedUp: credentialBackedUp,
    // app values
    name: passkeyName,
    createdAt: new Date(),
  };

  await users.updateOne({ username }, { $push: { credentials: newPasskey } });

  reply.send({ success: true });
});

// **Remove a Specific Passkey**
fastify.post('/remove-passkey', async (req, reply) => {
  const { username, credentialId } = req.body;

  await users.updateOne({ username }, { $pull: { credentials: { id: credentialId } } });

  reply.send({ success: true });
});

// **Get List of Passkeys**
fastify.get('/passkeys', async (req, reply) => {
  const { username } = req.query;

  if (!username) {
    return reply.code(400).send({ error: 'Username is required' });
  }

  const user = await users.findOne({ username });

  if (!user) {
    return reply.code(404).send({ error: 'User not found' });
  }

  const credentials =
    user.credentials?.map((credential) => ({
      id: credential.id,
      createdAt: credential.createdAt,
      name: credential.name || '<Unnamed>',
    })) ?? [];

  reply.send(credentials);
});

// **Login with Password**
fastify.post('/login', async (req, reply) => {
  const { username, password } = req.body;
  const user = await users.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return reply.code(400).send({ error: 'Invalid credentials' });
  }

  const challenge = generateChallengeForUser(user);
  const currentOptions = await getWebAuthnOptions(user);

  const options =
    user.credentials?.length > 0
      ? // has passkeys, generate authentication options
        await generateAuthenticationOptions({
          rpID: currentOptions.rp.id,
          allowCredentials: user.credentials.map(({ id }) => ({ id })),
          challenge,
        })
      : null;

  await trackLogin(username, req, true);

  const { accessToken, refreshToken } = generateTokens(username);
  await users.updateOne({ username }, { $set: { refreshToken } });

  reply
    .setCookie('token', accessToken, { ...baseCookieOptions, maxAge: 900 })
    .setCookie('refreshToken', refreshToken, { ...baseCookieOptions, maxAge: 604800 })
    .send({ success: true, options, mfaRequired: user.otpSecret ? true : false });
});

// **Verify Passkey Login & OTP MFA**
fastify.post('/login/verify', async (req, reply) => {
  const { username, response, otp, backupCode } = req.body;
  const user = await users.findOne({ username });
  const credential = user.credentials.find((cred) => cred.id === response.id);

  const currentOptions = await getWebAuthnOptions(user);

  const verification = await verifyAuthenticationResponse({
    response,
    expectedOrigin: frontendUrl,
    expectedChallenge: currentOptions.challenge,
    expectedRPID: currentOptions.rp.id,
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

  if (user.otpSecret) {
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

  await trackLogin(username, req, true);

  const { accessToken, refreshToken } = generateTokens(username);
  await users.updateOne({ username }, { $set: { refreshToken } });

  reply
    .setCookie('token', accessToken, { ...baseCookieOptions, maxAge: 900 })
    .setCookie('refreshToken', refreshToken, { ...baseCookieOptions, maxAge: 604800 })
    .send({ success: true });
});

// **Refresh Token Endpoint**
fastify.post('/refresh-token', async (req, reply) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return reply.code(401).send({ error: 'No refresh token provided' });
  }

  try {
    const decoded = fastify.jwt.verify(refreshToken);
    const user = await users.findOne({ username: decoded.username });

    if (!user || user.refreshToken !== refreshToken) {
      return reply.code(403).send({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.username);

    // Update the stored refresh token in the database
    await users.updateOne({ username: decoded.username }, { $set: { refreshToken: newRefreshToken } });

    // Set new tokens as cookies
    reply
      .setCookie('token', accessToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 900 })
      .setCookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 604800 })
      .send({ success: true });
  } catch {
    return reply.code(403).send({ error: 'Invalid refresh token' });
  }
});

// **Enable MFA Endpoint**
fastify.post('/enable-mfa', async (req, reply) => {
  const { username } = req.body;
  const user = await users.findOne({ username });

  if (!user) {
    return reply.code(400).send({ error: 'User not found' });
  }

  const secret = speakeasy.generateSecret({ length: 20 });
  const otpAuthUrl = speakeasy.otpauthURL({
    secret: secret.base32,
    label: `YourAppName (${username})`,
    issuer: 'YourAppName',
  });

  await users.updateOne({ username }, { $set: { otpSecret: secret.base32 } });

  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

  reply.send({
    secret: secret.base32,
    qrCode: qrCodeDataUrl,
  });
});

// **Login History Endpoint**
fastify.get('/login-history', async (req, reply) => {
  const { username } = req.query;

  if (!username) {
    return reply.code(400).send({ error: 'Username is required' });
  }

  const history = await loginAttempts.find({ username }).toArray();

  reply.send(history);
});

// **Trusted Device Management**
fastify.get('/trusted-devices', async (req, reply) => {
  const { username } = req.query;
  const user = await users.findOne({ username });

  reply.send(user.trustedDevices || []);
});

fastify.post('/remove-trusted-device', async (req, reply) => {
  const { username, deviceId } = req.body;
  await users.updateOne({ username }, { $pull: { trustedDevices: deviceId } });
  reply.send({ success: true });
});

// **Logout Endpoint**
fastify.post('/logout', async (req, reply) => {
  reply.clearCookie('token').clearCookie('refreshToken').send({ success: true });
});

fastify.listen({ port: 3000 }, () => console.log('Server running on http://localhost:3000'));
