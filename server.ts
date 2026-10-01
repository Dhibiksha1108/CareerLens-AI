// Global DOMMatrix polyfill for Node.js environment
if (typeof (globalThis as any).DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import apiRoutes from './server/routes/index.js';
import { errorHandler } from './server/middleware/errorMiddleware.js';
import { connectDB } from './server/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
// Dev server in AI Studio must always bind to port 3000 (never 8080 which is reserved for nginx)
const PORT = 3000;

async function startServer() {
  const app = express();

  // Connect to Database (handles offline / disconnected gracefully)
  await connectDB();

  // Standard middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'online',
      service: 'CareerLens AI Backend API',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API Routes
  app.use('/api', apiRoutes);

  // Return 404 for unhandled API endpoints
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
  });

  // Frontend integration: Vite middleware in dev, static dist in prod
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Error middleware
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CareerLens AI] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CareerLens AI] Failed to start server:', err);
});
