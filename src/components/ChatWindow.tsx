import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldAlert, Loader2, AlertTriangle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { queryAgent, fetchThreadHistory, approveAction, clearThreadHistory } from '../services/api';
import type { PendingActionDetail } from '../types/agent';

interface ChatWindowProps {
  threadId: string;
  onSessionChanged?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ threadId, onSessionChanged }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [pendingAction, setPendingAction] = useState<PendingActionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setError(null);
        const data = await fetchThreadHistory(threadId);
        
        const parsed = data.messages.map((m) => {
          if (m.startsWith('[HumanMessage]:')) {
            return { role: 'user', content: m.replace('[HumanMessage]:', '').trim() };
          }
          return { role: 'assistant', content: m.replace(/^\[[a-zA-Z]+\]:/, '').trim() };
        });

        setMessages(parsed);
        setPendingAction(data.pending_action || null);
      } catch {
        setError('Failed to load thread history.');
      }
    };

    loadHistory();
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, pendingAction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userQuery = question;
    setQuestion('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const data = await queryAgent(userQuery, threadId);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      setPendingAction(data.pending_action || null);
      if (onSessionChanged) onSessionChanged();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approve: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const data = await approveAction({ thread_id: threadId, approve });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      setPendingAction(null);
      if (onSessionChanged) onSessionChanged();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process approval.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm(`Clear message history for '${threadId}'?`)) return;
    try {
      await clearThreadHistory(threadId);
      setMessages([]);
      setPendingAction(null);
      if (onSessionChanged) onSessionChanged();
    } catch {
      setError('Failed to clear thread history.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Session Header Bar */}
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-mono">
          Active Thread: <span className="text-cyan-400 font-semibold">{threadId}</span>
        </span>
        <button
          onClick={handleClearHistory}
          className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors px-2 py-1 rounded border border-slate-800 hover:border-amber-900 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-20">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-cyan-500 opacity-60" />
            <p className="text-lg font-medium text-slate-300">Session Ready: {threadId}</p>
            <p className="text-sm">Submit security queries or trigger sensitive advisory generation.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl p-4 ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {/* HITL Interrupt Banner */}
        {pendingAction && (
          <div className="p-4 bg-amber-950/40 border border-amber-600/50 rounded-xl flex flex-col gap-3 my-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Human Approval Required: Sensitive Action Interrupted</span>
            </div>
            <div className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-lg font-mono border border-slate-800">
              <p><span className="text-amber-400">Tool:</span> {pendingAction.tool_name}</p>
              <p><span className="text-amber-400">Arguments:</span> {JSON.stringify(pendingAction.tool_args, null, 2)}</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleApproval(false)}
                disabled={loading}
                className="flex items-center gap-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Reject Action
              </button>
              <button
                onClick={() => handleApproval(true)}
                disabled={loading}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" /> Approve Execution
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-3 justify-start items-center text-slate-400 text-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
            <span>LangGraph engine executing step...</span>
          </div>
        )}

        {error && <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 flex gap-2 bg-slate-900/50">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type query or 'Call publish_security_advisory tool for CVE-2024-9999'..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium text-sm transition-colors cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send
        </button>
      </form>
    </div>
  );
};