// **Logout Endpoint**
export const logout = (fastify) => {
  fastify.post('/logout', async (_, reply) => {
    reply.clearCookie('token').clearCookie('refreshToken').send({ success: true });
  });
};
