import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'", FRONTEND_ORIGIN],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Restricted CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching frontend
      if (!origin || origin === FRONTEND_ORIGIN || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

// 3. Strict body size limits (1MB maximum payload)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. API Routes
app.use('/api', apiRouter);

// 5. Catch-all 404 handler
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// 6. Safe Global Error Handler (never leaks stack traces or credentials)
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[WattWise API Error]', err.name || 'Error', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message && !err.message.includes('C:\\') ? err.message : 'Internal Server Error',
  });
});


// Start listening if run directly
if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  app.listen(PORT, () => {
    console.log(`⚡ WattWise AI Backend running securely on http://localhost:${PORT}`);
    console.log(`🔒 Allowed Frontend Origin: ${FRONTEND_ORIGIN}`);
    console.log(`🤖 Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-3.8-flash'}`);
  });
}

export default app;
