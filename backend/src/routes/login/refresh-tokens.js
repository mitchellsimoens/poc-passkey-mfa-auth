import { baseCookieOptions, generateTokensFn } from './shared';
import { getCollection } from '../../db';

// **Refresh Token Endpoint**
export const refreshTokens = async (fastify) => {
  const users = await getCollection('users');
  const generateTokens = generateTokensFn(fastify);

  fastify.post('/refresh-token', async (req, reply) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return reply.code(401).send({ error: 'No refresh token provided' });
    }

    try {
      const decoded = fastify.jwt.verify(refreshToken);
      const user = await users.findOne({ username: decoded.username });

      if (!user || user.refreshToken !== refreshToken) {
        return reply.code(403).send({ error: 'Invalid refresh token' });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.username);

      // Update the stored refresh token in the database
      await users.updateOne({ username: decoded.username }, { $set: { refreshToken: newRefreshToken } });

      // Set new tokens as cookies
      reply
        .setCookie('token', accessToken, { ...baseCookieOptions, maxAge: 900 })
        .setCookie('refreshToken', newRefreshToken, { ...baseCookieOptions, maxAge: 604800 })
        .send({ success: true });
    } catch {
      return reply.code(403).send({ error: 'Invalid refresh token' });
    }
  });
};
