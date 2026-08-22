import React, { useState } from 'react';
import { Send } from 'lucide-react';

export function InputBar({ onSendMessage, isLoading }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit} className="input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about FlowDesk billing, technical issues, or account access..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!input.trim() || isLoading}
          title="Send message"
        >
          {isLoading ? <div className="spinner" /> : <Send size={18} />}
        </button>
      </form>
      <div className="input-hint">
        <span>Press <strong>Enter</strong> to send.</span>
        <span>SupportPilot AI answers strictly from verified FlowDesk documentation.</span>
      </div>
    </div>
  );
}
