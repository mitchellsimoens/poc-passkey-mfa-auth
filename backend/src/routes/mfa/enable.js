import QRCode from 'qrcode';
import speakeasy from 'speakeasy';
import { getCollection } from '../../db';

// **Enable MFA Endpoint**
export const enableMfa = async (fastify) => {
  const users = await getCollection('users');

  fastify.post('/enable-mfa', async (req, reply) => {
    const { username } = req.body;
    const user = await users.findOne({ username });

    if (!user) {
      return reply.code(400).send({ error: 'User not found' });
    }

    const secret = speakeasy.generateSecret({
      issuer: 'YourAppName', // TODO: Change this to a constant
    });

    await users.updateOne({ username }, { $set: { otpTempSecret: secret.base32 } });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    reply.send({
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
    });
  });
};
