import { MongoClient } from 'mongodb';

let mongoClient;

export const getMongoClient = async () => {
  if (mongoClient) {
    return mongoClient;
  }

  mongoClient = new MongoClient('mongodb://localhost:27017');

  await mongoClient.connect();

  return mongoClient;
};

export const getDb = async () => {
  const client = await getMongoClient();

  return client.db('passkeyAuth');
};

export const getCollection = async (name) => {
  const db = await getDb();

  return db.collection(name);
};
