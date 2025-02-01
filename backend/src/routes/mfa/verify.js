import speakeasy from 'speakeasy';
import { getCollection } from '../../db';

// **Verify MFA Code**
export const verifyMfa = async (fastify) => {
  const users = await getCollection('users');

  fastify.post('/verify-mfa', async (req, reply) => {
    const { username, token } = req.body;
    const user = await users.findOne({ username });

    if (!user || !user.otpTempSecret) {
      return reply.code(400).send({ error: 'MFA not enabled for this user' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.otpTempSecret,
      encoding: 'base32',
      token: token,
      window: 6,
    });

    if (!isValid) {
      return reply.code(400).send({ error: 'Invalid OTP code' });
    }

    await users.updateOne(
      { username },
      {
        $set: { otpSecret: user.otpTempSecret, otpEnabled: true },
        $unset: { otpTempSecret: '' },
      },
    );

    reply.send({ success: true });
  });
};
