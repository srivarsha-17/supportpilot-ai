/**
 * SupportPilot AI - Escalation Evaluation Service
 * 
 * Centralized, explainable escalation policy.
 * Thresholds are explicitly defined here and not scattered across the app.
 */

// Centralized Escalation Threshold
export const ESCALATION_THRESHOLD = 0.65;
export const MIN_CLASSIFICATION_CONFIDENCE = 0.45;

/**
 * Evaluates whether a customer query must be escalated to a human agent.
 * 
 * @param {object} params
 * @param {string} params.category - Classified ticket category
 * @param {number} params.classificationConfidence - Classifier confidence (0.0 - 1.0)
 * @param {number} params.topRetrievalScore - Top KB retrieval score (0.0 - 1.0)
 * @param {object[]} params.retrievedArticles - Retrieved KB candidate articles
 * @param {string} params.query - Customer raw message
 * @returns {{ shouldEscalate: boolean, reason: string, trigger: string }}
 */
export function evaluateEscalation({
  category,
  classificationConfidence,
  topRetrievalScore,
  retrievedArticles = [],
  query = ''
}) {
  // Trigger 1: Query classified as Out of Scope
  if (category === 'out_of_scope') {
    return {
      shouldEscalate: true,
      trigger: 'OUT_OF_SCOPE',
      reason: 'This request is outside FlowDesk product and support domain.'
    };
  }

  // Trigger 2: Low classification confidence (Ambiguous request)
  if (classificationConfidence < MIN_CLASSIFICATION_CONFIDENCE) {
    return {
      shouldEscalate: true,
      trigger: 'AMBIGUOUS_QUERY',
      reason: 'The inquiry is ambiguous and could not be reliably classified into a FlowDesk support category.'
    };
  }

  // Trigger 3: No articles retrieved or top retrieval score below threshold
  if (!retrievedArticles || retrievedArticles.length === 0 || topRetrievalScore < ESCALATION_THRESHOLD) {
    return {
      shouldEscalate: true,
      trigger: 'INSUFFICIENT_KB_EVIDENCE',
      reason: `Insufficient FlowDesk knowledge-base evidence found (relevance score: ${(topRetrievalScore * 100).toFixed(0)}% vs threshold ${(ESCALATION_THRESHOLD * 100).toFixed(0)}%).`
    };
  }

  // Trigger 4: Explicit unsupported FlowDesk enterprise / custom features check
  const unsupportedTopics = [
    'mainframe', 'on-premise installation', 'self-host', 'custom kernel',
    'depreciation', 'payroll processing', 'crypto payment', 'hardware lease'
  ];
  const queryLower = query.toLowerCase();
  const matchedUnsupported = unsupportedTopics.find(t => queryLower.includes(t));
  if (matchedUnsupported) {
    return {
      shouldEscalate: true,
      trigger: 'UNSUPPORTED_FLOWDESK_FEATURE',
      reason: `The requested capability ('${matchedUnsupported}') is not supported or documented in the standard FlowDesk knowledge base.`
    };
  }

  // Passed all checks -> Safe to answer
  return {
    shouldEscalate: false,
    trigger: 'NONE',
    reason: 'Adequate knowledge base evidence found with high confidence.'
  };
}
