/**
 * SupportPilot AI - Express Application Server
 * 
 * Entrypoint for Tier-1 Customer Support Backend.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import supportRouter from './routes/support.js';
import kbRouter from './routes/kb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// CORS configuration supporting local Vite client and deployed frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive fallback for seamless review & demo
  },
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount Routes
app.use('/api', supportRouter);
app.use('/api', kbRouter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SupportPilot AI API',
    status: 'online',
    version: '1.0.0',
    description: 'Tier-1 Customer Support AI Employee for FlowDesk SaaS',
    endpoints: {
      support: 'POST /api/support',
      health: 'GET /api/health',
      knowledgeBase: 'GET /api/kb'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: 'Endpoint not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({
    status: 'error',
    error: 'Internal server error occurred in SupportPilot AI.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SupportPilot AI Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   KB API: http://localhost:${PORT}/api/kb`);
  console.log(`   Support: POST http://localhost:${PORT}/api/support`);
  console.log(`====================================================`);
});
