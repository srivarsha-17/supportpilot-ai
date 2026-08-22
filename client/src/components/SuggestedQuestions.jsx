import React from 'react';
import { CreditCard, Key, Bell, HelpCircle, Server, FileText } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  {
    category: 'account_access',
    categoryLabel: 'Account Access',
    badgeClass: 'badge-account',
    icon: Key,
    text: 'How can I reset my password?'
  },
  {
    category: 'billing',
    categoryLabel: 'Billing',
    badgeClass: 'badge-billing',
    icon: CreditCard,
    text: 'Why did my subscription payment fail?'
  },
  {
    category: 'technical',
    categoryLabel: 'Technical',
    badgeClass: 'badge-technical',
    icon: Bell,
    text: "FlowDesk isn't sending me notifications."
  },
  {
    category: 'out_of_scope',
    categoryLabel: 'Out of Scope (Demo Escalation)',
    badgeClass: 'badge-out-of-scope',
    icon: HelpCircle,
    text: 'Can you recommend a laptop for gaming?'
  },
  {
    category: 'unsupported',
    categoryLabel: 'Unsupported Feature (Demo Escalation)',
    badgeClass: 'badge-out-of-scope',
    icon: Server,
    text: 'How do I deploy FlowDesk on our custom on-premise mainframe cluster?'
  },
  {
    category: 'billing',
    categoryLabel: 'Billing Policy',
    badgeClass: 'badge-billing',
    icon: FileText,
    text: 'What is the FlowDesk refund policy for annual plans?'
  }
];

export function SuggestedQuestions({ onSelectQuestion, disabled }) {
  return (
    <div className="suggested-section">
      <div className="suggested-title">Demo & Starter Inquiries</div>
      <div className="suggested-grid">
        {SUGGESTED_PROMPTS.map((prompt, idx) => {
          const IconComponent = prompt.icon;
          return (
            <button
              key={idx}
              className="suggested-btn"
              onClick={() => onSelectQuestion(prompt.text)}
              disabled={disabled}
            >
              <div className={`suggested-pill ${prompt.badgeClass}`}>
                {prompt.categoryLabel}
              </div>
              <div className="suggested-text">{prompt.text}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
