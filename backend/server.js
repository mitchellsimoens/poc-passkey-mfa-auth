import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';
import speakeasy from 'speakeasy';
import nodemailer from 'nodemailer';
import useragent from 'useragent';
import { verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

const fastify = Fastify({ logger: true });

fastify.register(cors, { origin: 'https://your-frontend-domain.com', credentials: true });
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
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// **Track Login Attempts & Alert User on New Device**
async function trackLogin(username, ip, userAgent, success) {
    const attempt = { username, ip, userAgent, success, timestamp: new Date() };
    await loginAttempts.insertOne(attempt);

    if (success) {
        const user = await users.findOne({ username });
        if (user?.email) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'New Login Detected',
                text: `A new login was detected:\n\n- IP: ${ip}\n- Device: ${userAgent}\n- Time: ${new Date().toLocaleString()}\n\nIf this was not you, please secure your account.`
            });
        }
    }
}

// **Register a Passkey with a Creation Date**
fastify.post('/register-passkey', async (req, reply) => {
    const { username, passkeyName, response } = req.body;
    const user = await users.findOne({ username });

    if (!user) return reply.code(400).send({ error: 'User not found' });

    const verification = await verifyRegistrationResponse({
        response,
        expectedOrigin: 'https://your-frontend-domain.com'
    });

    if (!verification.verified) return reply.code(400).send({ error: 'Passkey registration failed' });

    const passkey = {
        id: verification.registrationInfo.credentialID,
        name: passkeyName,
        publicKey: verification.registrationInfo.publicKey,
        createdAt: new Date()
    };

    await users.updateOne({ username }, { $push: { credentials: passkey } });

    reply.send({ success: true });
});

// **Remove a Specific Passkey**
fastify.post('/remove-passkey', async (req, reply) => {
    const { username, credentialId } = req.body;
    await users.updateOne({ username }, { $pull: { credentials: { id: credentialId } } });
    reply.send({ success: true });
});

// **Login with Password**
fastify.post('/login', async (req, reply) => {
    const { username, password } = req.body;
    const user = await users.findOne({ username });

    if (!user || !await bcrypt.compare(password, user.password)) {
        return reply.code(400).send({ error: 'Invalid credentials' });
    }

    const options = generateAuthenticationOptions({
        rpID: 'your-frontend-domain.com',
        allowCredentials: user.credentials
    });

    reply.send({ options, mfaRequired: user.otpSecret ? true : false });
});

// **Verify Passkey Login & OTP MFA**
fastify.post('/login/verify', async (req, reply) => {
    const { username, response, otp, backupCode } = req.body;
    const user = await users.findOne({ username });

    const verification = await verifyAuthenticationResponse({
        response,
        expectedOrigin: 'https://your-frontend-domain.com'
    });

    if (!verification.verified) return reply.code(400).send({ error: 'Authentication failed' });

    if (user.otpSecret) {
        const isOtpValid = speakeasy.totp.verify({
            secret: user.otpSecret,
            encoding: 'base32',
            token: otp
        });

        const isBackupCodeValid = user.backupCodes?.includes(backupCode);

        if (!isOtpValid && !isBackupCodeValid) return reply.code(400).send({ error: 'Invalid OTP or backup code' });

        if (isBackupCodeValid) {
            await users.updateOne({ username }, { $pull: { backupCodes: backupCode } });
        }
    }

    await trackLogin(username, req.ip, req.headers['user-agent'], true);

    const { accessToken, refreshToken } = generateTokens(username);
    await users.updateOne({ username }, { $set: { refreshToken } });

    reply
        .setCookie('token', accessToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 900 })
        .setCookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 604800 })
        .send({ success: true });
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

fastify.listen({ port: 3000 }, () => console.log('Server running on https://localhost:3000'));
