import { generateRegistrationOptions } from '@simplewebauthn/server';
import { isoUint8Array } from '@simplewebauthn/server/helpers';

const frontendUrl = 'http://localhost:5173';

export const generateChallengeForUser = (user) => isoUint8Array.fromUTF8String(user._id.toString() + user.username);

export const getWebAuthnOptions = async (user) => {
  const options = await generateRegistrationOptions({
    rpID: new URL(frontendUrl).hostname,
    rpName: 'ACME Corporation', // TODO: via config/env var
    userID: isoUint8Array.fromUTF8String(user._id.toString()),
    attestationType: 'none',
    userName: user.username,
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
    },
    challenge: generateChallengeForUser(user),
    // TODO: load current passkeys
    // excludeCredentials: userPasskeys.map(passkey => ({
    //   id: passkey.id,
    //   // Optional
    //   transports: passkey.transports,
    // })),
  });

  return options;
};
