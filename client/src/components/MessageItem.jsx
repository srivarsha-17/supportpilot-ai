import React from 'react';
import { Bot, User, AlertOctagon, Info, CheckCircle2 } from 'lucide-react';
import { CategoryBadge, ConfidenceBadge, SourceBadge } from './StatusBadge';

/**
 * Cleans unnecessary escaped markdown characters (like \*, \@, \_) from text.
 */
function sanitizeEscapedChars(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/\\@/g, '@')
    .replace(/\\\*/g, '*')
    .replace(/\\_/g, '_')
    .replace(/\\([*@_#~`\\\[\]\(\)-])/g, '$1');
}

/**
 * Basic markdown-style formatter for bold text, lists, and clean paragraphs.
 */
function FormattedText({ content }) {
  if (!content) return null;

  const cleanContent = sanitizeEscapedChars(content);
  const lines = cleanContent.split('\n');

  return (
    <div className="formatted-content">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: '8px' }} />;
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
              <span>•</span>
              <div>{renderInlineFormatting(line.replace(/^[-*]\s+/, ''))}</div>
            </div>
          );
        }

        if (/^\d+\.\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s+(.*)/);
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
              <span style={{ fontWeight: 600, color: '#818cf8' }}>{match[1]}</span>
              <div>{renderInlineFormatting(match[2])}</div>
            </div>
          );
        }

        return <p key={idx} style={{ margin: '4px 0' }}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
}

function renderInlineFormatting(text) {
  // Split on bold (**text**) and clean any stray boundary asterisks
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: '#f3f4f6', fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    
    // Check for single asterisk italics *text*
    const italicParts = part.split(/(\*[^*\n]+\*)/g);
    if (italicParts.length > 1) {
      return italicParts.map((subPart, j) => {
        if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
          return (
            <em key={`${i}-${j}`} style={{ color: '#e2e8f0' }}>
              {subPart.slice(1, -1)}
            </em>
          );
        }
        return subPart;
      });
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
