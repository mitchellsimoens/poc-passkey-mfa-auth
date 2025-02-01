import bcrypt from 'bcrypt';
import { getCollection } from '../db';

// **Register a User with Username & Password**
export const register = async (fastify) => {
  const users = await getCollection('users');

  fastify.post('/register', async (req, reply) => {
    const { username, password } = req.body;
    const userExists = await users.findOne({ username });

    if (userExists) {
      return reply.code(400).send({ error: 'User already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await users.insertOne({ username, password: hashedPassword });

    reply.send({ success: true });
  });
};
