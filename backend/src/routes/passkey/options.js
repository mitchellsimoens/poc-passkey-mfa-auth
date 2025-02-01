import { getCollection } from '../../db';
import { getWebAuthnOptions } from '../../auth-utils';

// **Get Passkey Registration Options**
export const getPasskeyOptions = async (fastify) => {
  const users = await getCollection('users');

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
};
