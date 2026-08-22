/**
 * SupportPilot AI - Knowledge Base & Health Routes
 */

import express from 'express';
import { getKnowledgeBaseMetadata } from '../services/retrieval.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SupportPilot AI Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.get('/kb', (req, res) => {
  const metadata = getKnowledgeBaseMetadata();
  res.json({
    status: 'success',
    ...metadata
  });
});

export default router;
