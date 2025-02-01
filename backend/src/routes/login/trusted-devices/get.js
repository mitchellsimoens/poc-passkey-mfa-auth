import { getCollection } from '../../../db';

// **Trusted Device Management**
export const trustedDevices = async (fastify) => {
  const users = await getCollection('users');

  fastify.get('/trusted-devices', async (req, reply) => {
    const { username } = req.query;
    const user = await users.findOne({ username });

    reply.send(user.trustedDevices || []);
  });
};
