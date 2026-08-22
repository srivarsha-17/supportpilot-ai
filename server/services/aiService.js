/**
 * SupportPilot AI - Grounded Answer Generation Service
 * 
 * Uses Google Gemini API to generate responses strictly grounded
 * in retrieved FlowDesk knowledge-base context.
 * Isolated behind a clean interface so the LLM provider can be swapped easily.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (apiKey && apiKey !== 'your_api_key_here' && apiKey.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash or gemini-2.0-flash
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('[AIService] Gemini AI initialized successfully with model: gemini-1.5-flash');
  } catch (err) {
    console.warn('[AIService] Failed to initialize Gemini client:', err.message);
  }
} else {
  console.log('[AIService] No GEMINI_API_KEY provided. Operating in deterministic grounded fallback mode.');
}

/**
 * Builds the strict grounding prompt for the LLM.
 * 
 * @param {string} query - Customer question
 * @param {object[]} articles - Retrieved KB articles
 * @returns {string} prompt
 */
function buildGroundingPrompt(query, articles) {
  const formattedContext = articles
    .map((art, idx) => `[Article ${idx + 1}] Title: ${art.title} (ID: ${art.id})\nCategory: ${art.category}\nContent: ${art.content}`)
    .join('\n\n---\n\n');

  return `You are SupportPilot AI, the official Tier-1 Customer Support Assistant for FlowDesk (a SaaS project management and collaboration platform).

Your core mandate is STRICT GROUNDING. You must answer the customer's question using ONLY the provided Knowledge Base Context below.

Rules:
1. Ground every single claim, price, instruction, and policy strictly in the provided FlowDesk context.
2. Do NOT extrapolate, speculate, or invent any features, pricing, or procedures not explicitly mentioned in the context.
3. Be professional, friendly, and concise. Format clear steps using numbered or bulleted lists when appropriate.
4. If the provided context is insufficient or incomplete to answer the query reliably, respond with the exact keyword "[ESCALATE_REQUIRED]" and explain what is missing.

Knowledge Base Context:
-----------------------
${formattedContext}
-----------------------

Customer Inquiry:
"${query}"

Helpful Grounded Response:`;
}

/**
 * Generates a deterministic grounded fallback response when LLM is unavailable.
 * @param {string} query 
 * @param {object[]} articles 
 * @returns {string}
 */
function generateDeterministicAnswer(query, articles) {
  const top = articles[0];
  return `Based on FlowDesk documentation for **${top.title}**:\n\n${top.content}\n\n*If you need further assistance, our team is happy to help!*`;
}

/**
 * Generates a grounded response for a customer inquiry.
 * 
 * @param {string} query - The customer inquiry
 * @param {object[]} articles - Retrieved knowledge base articles
 * @returns {Promise<{ answer: string, modelUsed: string, isGrounded: boolean }>}
 */
export async function generateGroundedResponse(query, articles) {
  if (!articles || articles.length === 0) {
    return {
      answer: "I don't have sufficient FlowDesk documentation to answer this question accurately.",
      modelUsed: 'none',
      isGrounded: false
    };
  }

  // If Gemini model is available, call the API
  if (model) {
    try {
      const prompt = buildGroundingPrompt(query, articles);
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2, // Low temperature for high factual adherence
          maxOutputTokens: 600
        }
      });

      const responseText = result.response.text().trim();

      if (responseText.includes('[ESCALATE_REQUIRED]')) {
        return {
          answer: responseText.replace('[ESCALATE_REQUIRED]', '').trim(),
          modelUsed: 'gemini-1.5-flash',
          isGrounded: false
        };
      }

      return {
        answer: responseText,
        modelUsed: 'gemini-1.5-flash',
        isGrounded: true
      };
    } catch (err) {
      console.error('[AIService] Gemini API error:', err.message);
      console.log('[AIService] Falling back to deterministic grounded generator.');
    }
  }

  // Fallback if no LLM key or LLM error
  const fallbackAnswer = generateDeterministicAnswer(query, articles);
  return {
    answer: fallbackAnswer,
    modelUsed: 'deterministic-grounded-engine',
    isGrounded: true
  };
}
