/**
 * SupportPilot AI - Ticket Classification Service
 * 
 * Classifies customer queries into:
 * - billing
 * - technical
 * - account_access
 * - out_of_scope
 * 
 * Returns an explainable confidence score between 0.0 and 1.0.
 * Confidence calculation is heuristic and transparently documented.
 */

// Category dictionary with weighted keywords
const CATEGORY_VOCABULARY = {
  billing: {
    primary: [
      'billing', 'payment', 'invoice', 'refund', 'subscription', 'price',
      'pricing', 'plan', 'upgrade', 'downgrade', 'card', 'credit card',
      'charge', 'charged', 'receipt', 'cancel', 'cancellation', 'cost',
      'annual', 'monthly', 'discount', 'seat', 'seats', 'vat', 'tax id'
    ],
    weight: 1.0
  },
  technical: {
    primary: [
      'error', 'bug', 'crash', 'spinner', 'loading', 'stuck', 'blank',
      'notification', 'notifications', 'push alert', 'email alert', 'upload',
      'file', 'attachment', 'slack', 'github', 'integration', 'webhook',
      '500', '502', '503', 'browser', 'chrome', 'firefox', 'safari', 'edge',
      'sync', 'conflict', 'offline', 'websocket', 'slow', 'performance'
    ],
    weight: 1.0
  },
  account_access: {
    primary: [
      'password', 'reset', 'forgot password', 'login', 'log in', 'signin',
      'sign in', 'locked', 'lockout', 'cooldown', '2fa', 'two-factor', 'mfa',
      'authenticator', 'backup code', 'recovery code', 'email address',
      'change email', 'verification', 'verify', 'sso', 'saml', 'okta', 'google login'
    ],
    weight: 1.0
  }
};

// Patterns explicitly indicating queries unrelated to FlowDesk SaaS support
const OUT_OF_SCOPE_TRIGGERS = [
  'gaming', 'laptop', 'weather', 'recipe', 'cooking', 'crypto', 'bitcoin',
  'movie', 'song', 'joke', 'hotel', 'flight', 'income tax return', 'tax return',
  'stock market', 'car repair', 'restaurant', 'sports', 'football', 'basketball',
  'health advice', 'doctor', 'medical'
];

/**
 * Normalizes input text: lowercases, removes special characters, and tokenizes.
 * @param {string} text 
 * @returns {string[]} tokens
 */
export function tokenizeAndNormalize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1);
}

/**
 * Classifies an incoming support message.
 * 
 * @param {string} message - Customer inquiry text
 * @returns {{ category: string, confidence: number, reasoning: string }}
 */
export function classifyTicket(message) {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return {
      category: 'out_of_scope',
      confidence: 0.0,
      reasoning: 'Empty or invalid message.'
    };
  }

  const rawLower = message.toLowerCase();
  const tokens = tokenizeAndNormalize(message);

  // 1. Check for explicit out-of-scope indicators
  const matchedOutOfScope = OUT_OF_SCOPE_TRIGGERS.filter(trigger => rawLower.includes(trigger));
  if (matchedOutOfScope.length > 0) {
    return {
      category: 'out_of_scope',
      confidence: 0.90,
      reasoning: `Matched out-of-scope trigger words: ${matchedOutOfScope.join(', ')}`
    };
  }

  // 2. Score match against each category vocabulary
  const scores = {
    billing: 0,
    technical: 0,
    account_access: 0
  };

  const matches = {
    billing: [],
    technical: [],
    account_access: []
  };

  for (const [category, data] of Object.entries(CATEGORY_VOCABULARY)) {
    for (const keyword of data.primary) {
      if (keyword.includes(' ')) {
        // Multi-word phrase check
        if (rawLower.includes(keyword)) {
          scores[category] += 2.5;
          matches[category].push(keyword);
        }
      } else {
        // Single token match
        if (tokens.includes(keyword)) {
          scores[category] += 1.5;
          matches[category].push(keyword);
        } else if (rawLower.includes(keyword)) {
          scores[category] += 0.8;
          matches[category].push(keyword);
        }
      }
    }
  }

  // 3. Find top scoring category
  const sortedCategories = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topCategory, topScore] = sortedCategories[0];
  const [runnerUpCategory, runnerUpScore] = sortedCategories[1];

  // 4. Calculate heuristic confidence
  if (topScore === 0) {
    return {
      category: 'out_of_scope',
      confidence: 0.30,
      reasoning: 'No FlowDesk domain keywords matched in query.'
    };
  }

  // Confidence formula:
  // Base confidence starts from keyword score saturation (up to 0.85)
  // Minus ambiguity penalty if runner-up is very close
  const saturation = Math.min(topScore / 5.0, 1.0); // 5 points = full saturation
  let baseConfidence = 0.50 + (saturation * 0.45); // Range: 0.50 to 0.95

  if (runnerUpScore > 0 && (topScore - runnerUpScore) < 1.0) {
    baseConfidence -= 0.15; // Ambiguity penalty
  }

  const roundedConfidence = Math.round(baseConfidence * 100) / 100;

  return {
    category: topCategory,
    confidence: roundedConfidence,
    reasoning: `Matched keywords [${matches[topCategory].join(', ')}] with raw score ${topScore.toFixed(1)}.`
  };
}
