import { getCollection } from '../../db';

// **Get List of Passkeys**
export const getPasskeys = async (fastify) => {
  const users = await getCollection('users');

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
};
