/**
 * SupportPilot AI - Knowledge Base Retrieval Service
 * 
 * Implements a lightweight, transparent keyword-overlap & token-relevance RAG retriever.
 * Inspectable, deterministic, and fully explainable for interviews.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tokenizeAndNormalize } from './classifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Knowledge Base data
const kbPath = path.join(__dirname, '..', 'data', 'knowledgeBase.json');
let knowledgeBase = [];

try {
  const rawData = fs.readFileSync(kbPath, 'utf-8');
  knowledgeBase = JSON.parse(rawData);
} catch (err) {
  console.error('[Retrieval] Failed to load knowledge base:', err.message);
  knowledgeBase = [];
}

// Common English stopwords to ignore during keyword matching
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'i', 'my', 'me', 'you', 'your',
  'we', 'our', 'they', 'how', 'what', 'why', 'can', 'do', 'does', 'did',
  'am', 'so', 'if', 'or', 'not', 'no', 'this', 'there', 'please', 'help',
  'isnt', 'arent', 'dont', 'doesnt', 'wont', 'cant', 'getting', 'got',
  'flowdesk' // Product name appears everywhere, so ignore for specific article discrimination
]);

/**
 * Checks if token matches target word by exact match, plural/singular, or root prefix.
 * @param {string} token 
 * @param {string} target 
 * @returns {boolean}
 */
function isStemMatch(token, target) {
  if (!token || !target) return false;
  if (token === target) return true;
  
  // Plural/singular strip 's' / 'es'
  const cleanA = token.replace(/(s|es|ing|ed)$/, '');
  const cleanB = target.replace(/(s|es|ing|ed)$/, '');
  if (cleanA.length >= 3 && cleanB.length >= 3 && cleanA === cleanB) return true;

  // Prefix overlap for words >= 5 chars
  if (token.length >= 5 && target.length >= 5) {
    if (token.startsWith(target.slice(0, 5)) || target.startsWith(token.slice(0, 5))) {
      return true;
    }
  }

  return false;
}

/**
 * Filters out stopwords from token list.
 * @param {string[]} tokens 
 * @returns {string[]} meaningful tokens
 */
function removeStopwords(tokens) {
  return tokens.filter(t => !STOPWORDS.has(t) && t.length > 2);
}

/**
 * Calculates a transparent relevance score between a query and a KB article.
 * 
 * @param {string} query - Raw user query
 * @param {string[]} queryTokens - Filtered query tokens
 * @param {object} article - Knowledge base article item
 * @param {string} [predictedCategory] - Category predicted by classifier
 * @returns {{ score: number, matchedTokens: string[] }}
 */
export function calculateRelevance(query, queryTokens, article, predictedCategory = null) {
  const queryLower = query.toLowerCase();
  const titleLower = article.title.toLowerCase();
  const summaryLower = (article.summary || '').toLowerCase();
  const contentLower = article.content.toLowerCase();
  const tagsLower = (article.tags || []).map(t => t.toLowerCase());

  let rawScore = 0;
  const matchedTokens = new Set();

  // 1. Tag matching
  for (const tag of tagsLower) {
    if (queryLower.includes(tag)) {
      rawScore += 3.5;
      matchedTokens.add(`tag:${tag}`);
    } else {
      // Check individual tag words
      const tagWords = tag.split(' ');
      for (const qToken of queryTokens) {
        if (tagWords.some(tw => isStemMatch(qToken, tw))) {
          rawScore += 2.0;
          matchedTokens.add(`tag-stem:${tag}`);
          break;
        }
      }
    }
  }

  // 2. Token-level matching across Title, Summary, Content
  const titleWords = titleLower.replace(/[^\w\s-]/g, ' ').split(/\s+/);
  const summaryWords = summaryLower.replace(/[^\w\s-]/g, ' ').split(/\s+/);
  const contentWords = contentLower.replace(/[^\w\s-]/g, ' ').split(/\s+/);

  for (const token of queryTokens) {
    let tokenMatched = false;

    // Title match (high weight)
    if (titleWords.some(w => isStemMatch(token, w))) {
      rawScore += 3.0;
      matchedTokens.add(`title:${token}`);
      tokenMatched = true;
    }

    // Summary match (medium weight)
    if (summaryWords.some(w => isStemMatch(token, w))) {
      rawScore += 1.8;
      matchedTokens.add(`summary:${token}`);
      tokenMatched = true;
    }

    // Content match (base weight)
    if (contentWords.some(w => isStemMatch(token, w))) {
      rawScore += 1.0;
      matchedTokens.add(`content:${token}`);
      tokenMatched = true;
    }
  }

  // 3. Category alignment bonus
  if (predictedCategory && article.category === predictedCategory) {
    rawScore += 1.5;
  }

  // 4. Normalization: scale rawScore to [0.0, 1.0]
  const numTokens = Math.max(queryTokens.length, 1);
  const targetThreshold = numTokens * 2.8 + 2.0;
  const normalizedScore = Math.min(Math.round((rawScore / targetThreshold) * 100) / 100, 0.98);

  return {
    score: normalizedScore,
    matchedTokens: Array.from(matchedTokens)
  };
}

/**
 * Retrieves top relevant articles for a customer inquiry.
 * 
 * @param {string} query - The customer's message
 * @param {string} [predictedCategory] - Optional category from classifier
 * @param {number} [limit=2] - Maximum number of articles to retrieve
 * @returns {{ articles: object[], topScore: number, queryTokens: string[] }}
 */
export function retrieveRelevantArticles(query, predictedCategory = null, limit = 2) {
  if (!query || typeof query !== 'string') {
    return { articles: [], topScore: 0, queryTokens: [] };
  }

  const allTokens = tokenizeAndNormalize(query);
  const meaningfulTokens = removeStopwords(allTokens);

  if (meaningfulTokens.length === 0) {
    return { articles: [], topScore: 0, queryTokens: [] };
  }

  const scoredArticles = knowledgeBase.map(article => {
    const { score, matchedTokens } = calculateRelevance(query, meaningfulTokens, article, predictedCategory);
    return {
      id: article.id,
      category: article.category,
      title: article.title,
      summary: article.summary,
      content: article.content,
      relevanceScore: score,
      matchedTokens
    };
  });

  // Sort by relevance score descending
  scoredArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

  const topArticles = scoredArticles.slice(0, limit);
  const topScore = topArticles.length > 0 ? topArticles[0].relevanceScore : 0;

  return {
    articles: topArticles,
    topScore,
    queryTokens: meaningfulTokens
  };
}

/**
 * Returns all knowledge base articles metadata (for UI / status).
 */
export function getKnowledgeBaseMetadata() {
  return {
    totalArticles: knowledgeBase.length,
    categories: {
      billing: knowledgeBase.filter(a => a.category === 'billing').length,
      technical: knowledgeBase.filter(a => a.category === 'technical').length,
      account_access: knowledgeBase.filter(a => a.category === 'account_access').length
    },
    articles: knowledgeBase.map(a => ({ id: a.id, title: a.title, category: a.category }))
  };
}
