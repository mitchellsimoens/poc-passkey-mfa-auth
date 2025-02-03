import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getCollection } from '../../db';
import { getWebAuthnOptions, generateChallengeForUser } from '../../auth-utils';

// **Login first step**
export const loginFirstStep = async (fastify) => {
  const users = await getCollection('users');

  fastify.post('/login', async (req, reply) => {
    const { username } = req.body;
    const user = await users.findOne({ username });

    if (!user) {
      return reply.code(400).send({ error: 'No user found' });
    }

    const challenge = generateChallengeForUser(user);
    const currentOptions = await getWebAuthnOptions(user);

    const options =
      user.credentials?.length > 0
        ? // has passkeys, generate authentication options
          await generateAuthenticationOptions({
            rpID: currentOptions.rp.id,
            allowCredentials: user.credentials.map(({ id }) => ({ id })),
            challenge,
          })
        : null;

    reply.send({ success: true, options, mfaRequired: Boolean(user.otpSecret) });
  });
};
