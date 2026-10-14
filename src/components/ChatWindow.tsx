import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Wrench, ShieldAlert, Loader2 } from 'lucide-react';
import { queryAgent } from '../services/api';
import type { MessageState } from '../types/agent';

export const ChatWindow: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; history?: MessageState[] }>>([]);
  const [error, setError] = useState<string | null>(null);

  // Ref for auto-scrolling to the latest message
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll whenever messages change or loading state toggles
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userQuery = question;
    setQuestion('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const data = await queryAgent(userQuery);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response, history: data.full_history },
      ]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to connect to Security Agent backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Message Output Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-20">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-cyan-500 opacity-60" />
            <p className="text-lg font-medium text-slate-300">Security Agent Readiness Active</p>
            <p className="text-sm">Ask about CVE details, CVSS scoring, or threat mitigation.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl p-4 ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>

              {/* Show tool trace indicator if present */}
              {msg.history && msg.history.some((h) => h.type === 'tool') && (
                <div className="mt-3 pt-2 border-t border-slate-700 text-xs text-slate-400 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Executed LangGraph Tool Sequence</span>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {/* Loading State Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start items-start">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm flex items-center gap-2">
              <span className="font-medium text-cyan-400">LangGraph Engine</span>
              <span className="text-slate-400">is processing query...</span>
              <span className="flex gap-1 items-center ml-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Anchor element for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 flex gap-2 bg-slate-900/50">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a security query (e.g., What is the details for CVE-2024-1234?)..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send
        </button>
      </form>
    </div>
  );
};