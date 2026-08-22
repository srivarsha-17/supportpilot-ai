/**
 * SupportPilot AI - Support API Route
 * 
 * Orchestrates:
 * 1. Request validation
 * 2. Classification
 * 3. Retrieval
 * 4. Escalation evaluation
 * 5. Grounded answer generation
 * 6. Structured response returning
 */

import express from 'express';
import { classifyTicket } from '../services/classifier.js';
import { retrieveRelevantArticles } from '../services/retrieval.js';
import { evaluateEscalation } from '../services/escalation.js';
import { generateGroundedResponse } from '../services/aiService.js';

const router = express.Router();

router.post('/support', async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        status: 'error',
        error: 'Invalid message. Please provide a non-empty text message.'
      });
    }

    const trimmedMessage = message.trim();
    console.log('\n========================================');
    console.log(`[Pipeline] Incoming Query: "${trimmedMessage}"`);

    // Step 1: Ticket Classification
    const classification = classifyTicket(trimmedMessage);
    console.log(`[Pipeline] Category: ${classification.category}`);
    console.log(`[Pipeline] Classification Confidence: ${classification.confidence}`);

    // Step 2: Knowledge Base Retrieval
    const retrieval = retrieveRelevantArticles(trimmedMessage, classification.category);
    const topArticle = retrieval.articles[0];
    console.log(`[Pipeline] Retrieved Article: ${topArticle ? topArticle.title : 'None'}`);
    console.log(`[Pipeline] Retrieval Score: ${retrieval.topScore}`);

    // Step 3: Escalation Evaluation
    const escalation = evaluateEscalation({
      category: classification.category,
      classificationConfidence: classification.confidence,
      topRetrievalScore: retrieval.topScore,
      retrievedArticles: retrieval.articles,
      query: trimmedMessage
    });

    if (escalation.shouldEscalate) {
      console.log(`[Pipeline] Decision: ESCALATE`);
      console.log(`[Pipeline] Reason: ${escalation.reason}`);
      console.log('========================================\n');

      return res.json({
        status: 'escalated',
        category: classification.category,
        confidence: classification.confidence,
        retrievalScore: retrieval.topScore,
        trigger: escalation.trigger,
        reason: escalation.reason,
        message: "I don't have enough verified FlowDesk documentation to answer that request reliably, so I have escalated this conversation to a human support specialist.",
        sources: retrieval.articles.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category,
          relevanceScore: a.relevanceScore
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Step 4: Grounded Answer Generation
    console.log(`[Pipeline] Decision: ANSWER`);
    const aiResult = await generateGroundedResponse(trimmedMessage, retrieval.articles);
    console.log(`[Pipeline] Model Used: ${aiResult.modelUsed}`);
    console.log('========================================\n');

    return res.json({
      status: 'answered',
      category: classification.category,
      confidence: classification.confidence,
      retrievalScore: retrieval.topScore,
      answer: aiResult.answer,
      modelUsed: aiResult.modelUsed,
      sources: retrieval.articles.map(a => ({
        id: a.id,
        title: a.title,
        category: a.category,
        relevanceScore: a.relevanceScore
      })),
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[Pipeline] Uncaught error in support pipeline:', err);
    next(err);
  }
});

export default router;
