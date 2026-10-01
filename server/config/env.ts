import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerlens_db',
  jwtSecret: process.env.JWT_SECRET || 'careerlens_default_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  environment: process.env.ENVIRONMENT || 'development',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000'
};
