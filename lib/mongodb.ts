import { MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  globalThis._mongoClientPromise ??= new MongoClient(uri).connect();
  const client = await globalThis._mongoClientPromise;

  return client.db(process.env.MONGODB_DB || undefined);
}
