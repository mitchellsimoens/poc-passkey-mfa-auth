import { generateAuthenticationOptions } from '@simplewebauthn/server';
import bcrypt from 'bcrypt';
import { trackLogin } from './shared';
import { getCollection } from '../../db';
import { getWebAuthnOptions, generateChallengeForUser } from '../../auth-utils';

// **Login first step**
export const loginFirstStep = async (fastify) => {
  const users = await getCollection('users');

  fastify.post('/login', async (req, reply) => {
    const { username, password } = req.body;
    const user = await users.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(400).send({ error: 'Invalid credentials' });
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

    await trackLogin(username, req, true);

    reply.send({ success: true, options, mfaRequired: user.otpSecret ? true : false });
  });
};
