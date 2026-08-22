/**
 * SupportPilot AI - Automated Pipeline Verification Test
 * 
 * Verifies the 5 core assessment test cases and additional edge cases:
 * - Case A (Billing): Subscription payment failed
 * - Case B (Account Access): Forgot password
 * - Case C (Technical): Notifications not working
 * - Case D (Out of Scope): Gaming laptop recommendation
 * - Case E (Unsupported FlowDesk): Custom mainframe / on-premise installation
 * - Case F (Billing): Refund policy inquiry
 * - Case G (Account Access): 2FA setup & backup codes
 * - Case H (Technical): Stuck on loading screen
 * - Case I (Out of Scope): Weather query
 * - Case J (Unsupported): Corporate tax preparation
 */

import { classifyTicket } from '../services/classifier.js';
import { retrieveRelevantArticles } from '../services/retrieval.js';
import { evaluateEscalation } from '../services/escalation.js';
import { generateGroundedResponse } from '../services/aiService.js';

const testCases = [
  {
    name: 'Case A: Billing (Failed Subscription Payment)',
    query: 'Why did my subscription payment fail?',
    expectedCategory: 'billing',
    expectEscalate: false
  },
  {
    name: 'Case B: Account Access (Forgot Password)',
    query: 'I forgot my password. How can I log in?',
    expectedCategory: 'account_access',
    expectEscalate: false
  },
  {
    name: 'Case C: Technical (Notifications Not Working)',
    query: "FlowDesk isn't sending me notifications.",
    expectedCategory: 'technical',
    expectEscalate: false
  },
  {
    name: 'Case D: Out of Scope (Gaming Laptop Recommendation)',
    query: 'Can you recommend a laptop for gaming?',
    expectedCategory: 'out_of_scope',
    expectEscalate: true,
    expectedReasonContains: 'outside FlowDesk'
  },
  {
    name: 'Case E: Unsupported FlowDesk Question (Mainframe & Hardware)',
    query: 'How do I deploy FlowDesk on our custom on-premise mainframe hardware cluster?',
    expectEscalate: true
  },
  {
    name: 'Case F: Billing (Refund Policy)',
    query: 'What is FlowDesk refund policy for annual plans?',
    expectedCategory: 'billing',
    expectEscalate: false
  },
  {
    name: 'Case G: Account Access (2FA Setup)',
    query: 'How do I enable two-factor authentication and backup codes?',
    expectedCategory: 'account_access',
    expectEscalate: false
  },
  {
    name: 'Case H: Technical (Browser Stuck on Loading Screen)',
    query: 'The FlowDesk web app is stuck on a spinner and not loading.',
    expectedCategory: 'technical',
    expectEscalate: false
  },
  {
    name: 'Case I: Out of Scope (Weather Forecast)',
    query: 'What is the weather forecast in New York tomorrow?',
    expectedCategory: 'out_of_scope',
    expectEscalate: true
  },
  {
    name: 'Case J: Out of Scope (Income Tax Return)',
    query: 'Can FlowDesk prepare my income-tax return for 2026?',
    expectedCategory: 'out_of_scope',
    expectEscalate: true
  }
];

async function runTests() {
  console.log('🧪 Starting SupportPilot AI Comprehensive Pipeline Tests...\n');
  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`--------------------------------------------------`);
    console.log(`▶ Testing: ${tc.name}`);
    console.log(`  Query: "${tc.query}"`);

    // 1. Classification
    const classification = classifyTicket(tc.query);
    console.log(`  Classification: ${classification.category} (Confidence: ${classification.confidence})`);

    if (tc.expectedCategory && classification.category !== tc.expectedCategory) {
      console.error(`  ❌ FAILED: Expected category '${tc.expectedCategory}', got '${classification.category}'`);
      failed++;
      continue;
    }

    // 2. Retrieval
    const retrieval = retrieveRelevantArticles(tc.query, classification.category);
    const topArt = retrieval.articles[0];
    console.log(`  Retrieval Top Score: ${retrieval.topScore} (Top Article: ${topArt ? topArt.title : 'None'})`);

    // 3. Escalation Evaluation
    const escalation = evaluateEscalation({
      category: classification.category,
      classificationConfidence: classification.confidence,
      topRetrievalScore: retrieval.topScore,
      retrievedArticles: retrieval.articles,
      query: tc.query
    });

    console.log(`  Escalation Decision: ${escalation.shouldEscalate ? 'ESCALATE' : 'ANSWER'}`);
    if (escalation.shouldEscalate) {
      console.log(`  Escalation Trigger: ${escalation.trigger}`);
      console.log(`  Escalation Reason: ${escalation.reason}`);
    }

    if (escalation.shouldEscalate !== tc.expectEscalate) {
      console.error(`  ❌ FAILED: Expected shouldEscalate=${tc.expectEscalate}, got ${escalation.shouldEscalate}`);
      failed++;
      continue;
    }

    // 4. Grounded Response Generation if answered
    if (!escalation.shouldEscalate) {
      const aiResponse = await generateGroundedResponse(tc.query, retrieval.articles);
      console.log(`  Answer Model: ${aiResponse.modelUsed}`);
      console.log(`  Answer Snippet: ${aiResponse.answer.slice(0, 90)}...`);
    }

    console.log(`  ✅ PASSED`);
    passed++;
  }

  console.log(`\n==================================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
