import { getCollection } from '../../../db';

// **Remove Trusted Device**
export const removeTrustedDevices = async (fastify) => {
  const users = await getCollection('users');

  fastify.post('/remove-trusted-device', async (req, reply) => {
    const { username, deviceId } = req.body;

    await users.updateOne({ username }, { $pull: { trustedDevices: deviceId } });

    reply.send({ success: true });
  });
};
