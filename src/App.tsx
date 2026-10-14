import React, { useEffect, useRef, useState } from 'react';
import { Shield, Activity } from 'lucide-react';
import { ChatWindow } from './components/ChatWindow';
import { checkHealth } from './services/api';

export const App: React.FC = () => {
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const initialized = useRef(false)
  
  useEffect(() => {
    const runCheck = () => {
    console.log("Checking server health....");
    checkHealth()
      .then(() => {
        console.log("Server Up");
        setHealthy(true);
      })
      .catch(() => {
        console.log("Server Down");
        setHealthy(false);
      });
    };
  
    // 1. Run immediately on mount
    runCheck();
  
    // 2. Schedule recurring checks every 10 seconds
    const timerId = setInterval(runCheck, 10000);
  
    // 3. Clean up timer on component unmount
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-xl">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Security Agent Interface</h1>
            <p className="text-xs text-slate-400">LangGraph State Engine + FastAPI Orchestrator</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <Activity className={`w-3.5 h-3.5 ${healthy ? 'text-emerald-400' : 'text-red-400'}`} />
          <span className="text-slate-300">
            Backend: {healthy === null ? 'Connecting...' : healthy ? 'Online (8000)' : 'Offline'}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <ChatWindow />
      </main>
    </div>
  );
};

export default App;