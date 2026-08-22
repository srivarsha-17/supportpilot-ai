import React from 'react';
import { Tag, ShieldCheck, BookOpen, AlertTriangle, HelpCircle } from 'lucide-react';

export function CategoryBadge({ category }) {
  if (!category) return null;

  const config = {
    billing: {
      label: 'Billing',
      className: 'badge-billing'
    },
    technical: {
      label: 'Technical',
      className: 'badge-technical'
    },
    account_access: {
      label: 'Account Access',
      className: 'badge-account'
    },
    out_of_scope: {
      label: 'Out of Scope',
      className: 'badge-out-of-scope'
    }
  };

  const item = config[category] || {
    label: category,
    className: 'badge-confidence'
  };

  return (
    <span className={`badge ${item.className}`}>
      <Tag size={12} />
      {item.label}
    </span>
  );
}

export function ConfidenceBadge({ confidence }) {
  if (confidence === undefined || confidence === null) return null;
  const percent = Math.round(confidence * 100);

  return (
    <span className="badge badge-confidence">
      <ShieldCheck size={12} />
      {percent}% Confidence
    </span>
  );
}

export function SourceBadge({ sources = [] }) {
  if (!sources || sources.length === 0) return null;
  const primary = sources[0];

  return (
    <span className="badge badge-source" title={`ID: ${primary.id}`}>
      <BookOpen size={12} />
      Source: {primary.title}
    </span>
  );
}
