import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`[Server] CareerLens AI API running in ${config.nodeEnv} mode on port ${config.port}`);
  });

  process.on('unhandledRejection', (err: Error) => {
    console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
  });
};

startServer();
