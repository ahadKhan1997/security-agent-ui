import React, { useEffect, useState } from 'react';
import { Shield, Activity, PlusCircle, MessageSquare, Trash2 } from 'lucide-react';
import { ChatWindow } from './components/ChatWindow';
import { checkHealth, createThread, listThreads, deleteThread } from './services/api';
import type { ThreadInfo } from './types/agent';

export const App: React.FC = () => {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [threads, setThreads] = useState<ThreadInfo[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('session-101');

  // Fetch persisted threads from SQLite database
  const refreshThreads = async () => {
    try {
      const data = await listThreads();
      setThreads(data);
    } catch {
      // Fall back silently
    }
  };

  useEffect(() => {
    const runCheck = () => {
      checkHealth()
        .then(() => setHealthy(true))
        .catch(() => setHealthy(false));
    };

    runCheck();
    refreshThreads();

    const timerId = setInterval(runCheck, 10000);
    return () => clearInterval(timerId);
  }, []);

  const handleCreateNewChat = async () => {
    try {
      const { thread_id } = await createThread();
      // Set active thread to newly generated thread ID without overwriting it
      setActiveThreadId(thread_id);
      await refreshThreads();
    } catch (err) {
      console.error('Failed to create new thread:', err);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, targetThreadId: string) => {
    e.stopPropagation();
    if (!window.confirm(`Delete chat session '${targetThreadId}'?`)) return;

    try {
      await deleteThread(targetThreadId);
      const updated = threads.filter((t) => t.thread_id !== targetThreadId);
      setThreads(updated);
      
      // If deleting current active thread, switch to another available thread or create a new one
      if (activeThreadId === targetThreadId) {
        if (updated.length > 0) {
          setActiveThreadId(updated[0].thread_id);
        } else {
          handleCreateNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete thread:', err);
    }
  };

  // Combine DB threads with active unsaved thread if it's new
  const allDisplayThreads = [...threads];
  if (!allDisplayThreads.some((t) => t.thread_id === activeThreadId)) {
    allDisplayThreads.unshift({ thread_id: activeThreadId, message_count: 0 });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Header */}
      <header className="px-6 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-xl">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight">Security Agent Platform</h1>
            <p className="text-xs text-slate-400">LangGraph Engine + SQLite Session Persistence</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs">
          <Activity className={`w-3.5 h-3.5 ${healthy ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className="text-slate-300">
            Backend: {healthy === null ? 'Connecting...' : healthy ? 'Online (8000)' : 'Offline'}
          </span>
        </div>
      </header>

      {/* Main Layout: Left Session Sidebar + Chat Window */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <button
              onClick={handleCreateNewChat}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors cursor-pointer shadow-lg shadow-cyan-950/50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Chat</span>
            </button>

            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Chat Sessions ({allDisplayThreads.length})
              </h2>
              
              <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {allDisplayThreads.map((t) => {
                  const isActive = t.thread_id === activeThreadId;
                  return (
                    <div
                      key={t.thread_id}
                      onClick={() => setActiveThreadId(t.thread_id)}
                      className={`group flex items-center justify-between p-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                        isActive
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span className="truncate">{t.thread_id}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-500">
                          {t.message_count}
                        </span>
                        <button
                          onClick={(e) => handleDeleteSession(e, t.thread_id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-0.5"
                          title="Delete session"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3 text-center">
            Thread ID: <span className="text-cyan-400 font-mono">{activeThreadId}</span>
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 p-4 bg-slate-950 overflow-hidden">
          <ChatWindow threadId={activeThreadId} onSessionChanged={refreshThreads} />
        </main>
      </div>
    </div>
  );
};

export default App;