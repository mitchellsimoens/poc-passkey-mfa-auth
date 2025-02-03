import { getCollection } from '../../db';

// **Disable MFA Endpoint**
export const disableMfa = async (fastify) => {
  const users = await getCollection('users');

  fastify.post('/disable-mfa', async (req, reply) => {
    const { username } = req.body;
    const user = await users.findOne({ username });

    if (!user) {
      return reply.code(400).send({ error: 'User not found' });
    }

    if (!user.otpSecret) {
      reply.send({
        success: true,
      });
    }

    await users.updateOne({ username }, { $unset: { otpEnabled: '', otpSecret: '' } });

    reply.send({
      success: true,
    });
  });
};
