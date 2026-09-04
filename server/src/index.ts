// =============================================================================
// GridNova Backend Server Entrypoint
// Conforms to Rules 4, 5, 11, 42, 51 and TRD Section 4
// =============================================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for auditability (Rule 45)
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  if (!req.path.startsWith('/api/health')) {
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'GridNova Core Engine',
    version: '1.0.0-MVP',
    network: 'GridNova Test Network (Mock Blockchain)',
    time: new Date().toISOString(),
  });
});

// Mount Core API
app.use('/api', apiRouter);

// Global 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested API endpoint was not found on GridNova Core Engine',
    },
  });
});

// Global Error Handler (Rule 51: Never allow raw stack trace to leak)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[GridNova Engine Error]:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred within GridNova simulation services',
    },
  });
});

app.listen(PORT, () => {
  console.log(`
  =============================================================
   ⚡ GRIDNOVA — AI-Driven Blockchain P2P Renewable Energy
   🚀 Server running on: http://localhost:${PORT}
   📡 REST API Base:     http://localhost:${PORT}/api
   🔗 Mock Blockchain:   GridNova Test Network (Active)
   🤖 AI Advisory:       Gemini API / Resilient Heuristics
  =============================================================
  `);
});
