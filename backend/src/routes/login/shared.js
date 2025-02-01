import nodemailer from 'nodemailer';
import useragent from 'useragent';
import { getCollection } from '../../db';

const frontendUrl = 'http://localhost:5173';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// **Track Login Attempts & Alert User on New Device**
export async function trackLogin(username, req, success) {
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

  const loginAttempts = await getCollection('loginAttempts');
  await loginAttempts.insertOne(loginRecord);

  if (process.env.EMAIL_USER && success) {
    const users = await getCollection('users');
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

export const baseCookieOptions = {
  secure: new URL(frontendUrl).protocol === 'https:',
  sameSite: 'Lax', // Changed from Strict for development
  path: '/', // Add explicit path
  domain: process.env.COOKIE_DOMAIN || new URL(frontendUrl).hostname,
  maxAge: 900,
};

export const generateTokensFn = (fastify) => (username) => ({
  accessToken: fastify.jwt.sign({ username }, { expiresIn: '15m' }),
  refreshToken: fastify.jwt.sign({ username }, { expiresIn: '7d' }),
});
