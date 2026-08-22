import React from 'react';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { AlertCircle, Bot, Sparkles } from 'lucide-react';

export function ChatContainer({
  messages,
  isLoading,
  error,
  onSendMessage,
  onSelectQuestion,
  onClearError
}) {
  return (
    <main className="chat-main">
      {/* Top Header */}
      <header className="chat-header">
        <div className="header-left">
          <h2>
            <Bot size={20} color="#818cf8" />
            FlowDesk Support
          </h2>
          <p>AI-powered Tier-1 assistance · Grounded in verified documentation</p>
        </div>

        <div className="header-badge">
          <span>Tier-1 Active</span>
        </div>
      </header>

      {/* Main Conversation Stream */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onSelectQuestion={onSelectQuestion}
      />

      {/* Input Form */}
      <InputBar
        onSendMessage={onSendMessage}
        isLoading={isLoading}
      />

      {/* Error Toast if server unreachable */}
      {error && (
        <div className="error-toast">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button
            onClick={onClearError}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fecaca',
              marginLeft: '8px',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
