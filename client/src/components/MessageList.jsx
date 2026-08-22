import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { SuggestedQuestions } from './SuggestedQuestions';
import { Bot, Sparkles } from 'lucide-react';

export function MessageList({ messages, isLoading, onSelectQuestion }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="messages-container">
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <Sparkles size={30} />
          </div>
          <h3>Welcome to FlowDesk Tier-1 AI Support</h3>
          <p>
            I am <strong>SupportPilot AI</strong>, your grounded support assistant. I can assist with
            account access, billing questions, and technical troubleshooting based directly on official FlowDesk documentation.
          </p>

          <SuggestedQuestions onSelectQuestion={onSelectQuestion} disabled={isLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {messages.map((msg, index) => (
        <MessageItem key={msg.id || index} message={msg} />
      ))}

      {isLoading && (
        <div className="message-wrap assistant">
          <div className="avatar assistant">
            <Bot size={18} />
          </div>
          <div className="message-body">
            <div className="bubble assistant" style={{ padding: '8px 12px' }}>
              <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
