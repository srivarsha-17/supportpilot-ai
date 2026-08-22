import React from 'react';
import { Bot, PlusCircle, Database, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export function Sidebar({ onNewChat, kbMetadata, isOnline }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon">
          <Bot size={22} />
        </div>
        <div className="brand-info">
          <h1>SupportPilot AI</h1>
          <p>FlowDesk Tier-1 Support</p>
        </div>
      </div>

      <div className="sidebar-content">
        <button className="sidebar-btn" onClick={onNewChat}>
          <PlusCircle size={16} />
          <span>New Conversation</span>
        </button>

        {/* System Status Card */}
        <div className="sidebar-card">
          <div className="sidebar-card-title">
            <span>System Status</span>
            <Cpu size={14} />
          </div>
          <div className="status-indicator">
            <span className="status-dot" style={{ backgroundColor: isOnline ? '#10b981' : '#ef4444', boxShadow: isOnline ? '0 0 8px #10b981' : '0 0 8px #ef4444' }} />
            <span>{isOnline ? 'AI Employee Online' : 'Connecting to Server...'}</span>
          </div>
        </div>

        {/* Knowledge Base Status Card */}
        <div className="sidebar-card">
          <div className="sidebar-card-title">
            <span>Knowledge Base</span>
            <Database size={14} />
          </div>
          <div className="kb-stat-list">
            <div className="kb-stat-row">
              <span>Total Articles:</span>
              <span className="kb-stat-pill">{kbMetadata?.totalArticles || 21}</span>
            </div>
            <div className="kb-stat-row">
              <span>Billing:</span>
              <span className="kb-stat-pill">{kbMetadata?.categories?.billing || 8}</span>
            </div>
            <div className="kb-stat-row">
              <span>Technical:</span>
              <span className="kb-stat-pill">{kbMetadata?.categories?.technical || 7}</span>
            </div>
            <div className="kb-stat-row">
              <span>Account Access:</span>
              <span className="kb-stat-pill">{kbMetadata?.categories?.account_access || 6}</span>
            </div>
          </div>
        </div>

        {/* Safety & Grounding Policy Card */}
        <div className="sidebar-card">
          <div className="sidebar-card-title">
            <span>Guardrails</span>
            <ShieldAlert size={14} />
          </div>
          <div className="kb-stat-list">
            <div className="kb-stat-row">
              <span>Escalation Rule:</span>
              <span className="kb-stat-pill" style={{ color: '#f59e0b' }}>&lt; 65% Score</span>
            </div>
            <div className="kb-stat-row">
              <span>Grounding Mode:</span>
              <span className="kb-stat-pill" style={{ color: '#10b981' }}>Strict RAG</span>
            </div>
            <div className="kb-stat-row">
              <span>Out-of-Scope:</span>
              <span className="kb-stat-pill" style={{ color: '#ef4444' }}>Auto-Escalate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div><strong>FlowDesk SupportPilot</strong> v1.0</div>
        <div>Supervity FDE Technical Assessment</div>
      </div>
    </aside>
  );
}
