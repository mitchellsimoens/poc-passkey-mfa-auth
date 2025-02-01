import { getCollection } from '../../db';

// **Verify MFA Code**
export const loginHistory = async (fastify) => {
  const loginAttempts = await getCollection('loginAttempts');

  fastify.get('/login-history', async (req, reply) => {
    const { username } = req.query;

    if (!username) {
      return reply.code(400).send({ error: 'Username is required' });
    }

    const history = await loginAttempts.find({ username }).toArray();

    reply.send(history);
  });
};
