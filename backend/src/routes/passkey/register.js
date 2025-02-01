import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { getCollection } from '../../db';
import { getWebAuthnOptions } from '../../auth-utils';

const frontendUrl = 'http://localhost:5173';

// **Register a Passkey with a Creation Date**
export const registerPasskey = async (fastify) => {
  const users = await getCollection('users');

  fastify.post('/register-passkey', async (req, reply) => {
    const { username, passkeyName, response } = req.body;
    const user = await users.findOne({ username });

    if (!user) {
      return reply.code(400).send({ error: 'User not found' });
    }

    const currentOptions = await getWebAuthnOptions(user);

    const verification = await verifyRegistrationResponse({
      response,
      expectedOrigin: frontendUrl,
      expectedChallenge: currentOptions.challenge,
      expectedRPID: currentOptions.rp.id,
    });

    if (!verification.verified) {
      return reply.code(400).send({ error: 'Passkey registration failed' });
    }

    const { registrationInfo } = verification;
    const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
    const newPasskey = {
      // Created by `generateRegistrationOptions()` in Step 1
      webAuthnUserID: currentOptions.user.id,
      // A unique identifier for the credential
      id: credential.id,
      // The public key bytes, used for subsequent authentication signature verification
      publicKey: credential.publicKey.toBase64(),
      // The number of times the authenticator has been used on this site so far
      counter: credential.counter,
      // How the browser can talk with this credential's authenticator
      transports: credential.transports,
      // Whether the passkey is single-device or multi-device
      deviceType: credentialDeviceType,
      // Whether the passkey has been backed up in some way
      backedUp: credentialBackedUp,
      // app values
      name: passkeyName,
      createdAt: new Date(),
    };

    await users.updateOne({ username }, { $push: { credentials: newPasskey } });

    reply.send({ success: true });
  });
};
