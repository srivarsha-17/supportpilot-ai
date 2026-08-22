import React from 'react';
import { Bot, User, AlertOctagon, Info, CheckCircle2 } from 'lucide-react';
import { CategoryBadge, ConfidenceBadge, SourceBadge } from './StatusBadge';

/**
 * Basic markdown-style formatter for bold text and lists.
 */
function FormattedText({ content }) {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div className="formatted-content">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: '8px' }} />;
        }

        // Bold formatting parse **text**
        const formattedLine = renderBoldSpans(line);

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
              <span>•</span>
              <div>{renderBoldSpans(line.replace(/^[-*]\s+/, ''))}</div>
            </div>
          );
        }

        if (/^\d+\.\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s+(.*)/);
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
              <span style={{ fontWeight: 600, color: '#818cf8' }}>{match[1]}</span>
              <div>{renderBoldSpans(match[2])}</div>
            </div>
          );
        }

        return <p key={idx} style={{ margin: '4px 0' }}>{formattedLine}</p>;
      })}
    </div>
  );
}

function renderBoldSpans(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#f3f4f6', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function MessageItem({ message }) {
  const isUser = message.sender === 'user';
  const isEscalated = message.status === 'escalated';

  return (
    <div className={`message-wrap ${isUser ? 'user' : 'assistant'}`}>
      <div className={`avatar ${isUser ? 'user' : 'assistant'}`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className="message-body">
        {isUser ? (
          <div className="bubble user">
            {message.text}
          </div>
        ) : isEscalated ? (
          <div className="escalation-card">
            <div className="escalation-header">
              <AlertOctagon size={18} />
              <span>Escalated to Human Support Specialist</span>
            </div>

            <div className="escalation-text">
              {message.text || message.message}
            </div>

            {message.reason && (
              <div className="escalation-reason-box">
                <strong>Escalation Reason:</strong> {message.reason}
              </div>
            )}

            <div className="message-meta">
              <CategoryBadge category={message.category} />
              <ConfidenceBadge confidence={message.confidence} />
            </div>
          </div>
        ) : (
          <>
            <div className="bubble assistant">
              <FormattedText content={message.text || message.answer} />
            </div>

            <div className="message-meta">
              <CategoryBadge category={message.category} />
              <ConfidenceBadge confidence={message.confidence} />
              <SourceBadge sources={message.sources} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
