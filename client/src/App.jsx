import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatContainer } from './components/ChatContainer';
import { sendSupportMessage, fetchKbMetadata, checkBackendHealth } from './services/api';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kbMetadata, setKbMetadata] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  // Load initial KB metadata & health check
  useEffect(() => {
    async function init() {
      const [meta, online] = await Promise.all([
        fetchKbMetadata(),
        checkBackendHealth()
      ]);
      if (meta) setKbMetadata(meta);
      setIsOnline(online);
    }
    init();
  }, []);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    setError(null);

    const userMessageId = `msg-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await sendSupportMessage(text.trim());
      setIsOnline(true);

      const assistantMessageId = `msg-ai-${Date.now()}`;
      const assistantMessage = {
        id: assistantMessageId,
        sender: 'assistant',
        status: result.status, // 'answered' or 'escalated'
        category: result.category,
        confidence: result.confidence,
        retrievalScore: result.retrievalScore,
        text: result.status === 'answered' ? result.answer : result.message,
        reason: result.reason,
        trigger: result.trigger,
        sources: result.sources || [],
        timestamp: result.timestamp || new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Failed to get support response:', err);
      setIsOnline(false);
      setError('Could not connect to SupportPilot AI server. Please verify the backend is running.');

      const fallbackErrorMsg = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        status: 'escalated',
        category: 'technical',
        confidence: 0.0,
        text: 'An unexpected connection issue occurred while processing your request. Please try again in a few moments.',
        reason: err.message || 'Network error communicating with API.',
        sources: [],
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, fallbackErrorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="app-layout">
      <Sidebar
        onNewChat={handleNewChat}
        kbMetadata={kbMetadata}
        isOnline={isOnline}
      />
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSendMessage={handleSendMessage}
        onSelectQuestion={handleSendMessage}
        onClearError={() => setError(null)}
      />
    </div>
  );
}
