import mongoose from 'mongoose';
import { config } from './env.js';

let mongodInstance: any = null;

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (err: any) {
    console.warn(`[Database] Could not connect directly to ${config.mongoUri} (${err.message}). Initializing local MongoDB server...`);
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'careerlens_db'
      }
    });
    const uri = mongodInstance.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (${uri})`);
  } catch (err: any) {
    console.error(`[Database] Error connecting to MongoDB: ${err.message}`);
  }
};
