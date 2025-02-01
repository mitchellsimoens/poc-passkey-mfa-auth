import { getCollection } from '../../db';

// **Remove a Specific Passkey**
export const removePasskey = async (fastify) => {
  const users = await getCollection('users');

  fastify.post('/remove-passkey', async (req, reply) => {
    const { username, credentialId } = req.body;

    await users.updateOne({ username }, { $pull: { credentials: { id: credentialId } } });

    reply.send({ success: true });
  });
};
