// Maya Agent Hub - Full AI Command Center & Evolution Center
import React, { useState } from 'react';
import { useAgents } from '../../context/AgentContext';
import { useAppData } from '../../context/AppDataContext';
import { AgentGraphVisualizer } from './AgentGraphVisualizer';
import { 
  Bot, 
  Sparkles, 
  Key, 
  Database, 
  History, 
  TrendingUp, 
  Zap, 
  CheckCircle2,
  Send,
  RefreshCw
} from 'lucide-react';

export function MayaAgentHub({ onOpenChat }) {
  const { agents, memories, selectedAgentId, setSelectedAgentId, sendMessageToAgent } = useAgents();
  const { amparoCalls, msrLeads, attendance, revenueLog } = useAppData();
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('msr_custom_groq_key') || '');
  const [keySaved, setKeySaved] = useState(false);

  const activeAgent = agents[selectedAgentId] || agents.ops_manager;

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    if (apiKeyInput.trim()) {
      localStorage.setItem('msr_custom_groq_key', apiKeyInput.trim());
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 3000);
    }
  };

  const quickPrompts = [
    {
      label: '⚡ Aaj ka Standup Brief',
      text: 'Aaj ke operational priorities aur team targets ka summary dijiye.'
    },
    {
      label: '🚨 Urgent RTO Triage',
      text: 'Call queue me kitne urgent RTO orders hain aur unka action plan kya hai?'
    },
    {
      label: '📍 GPS Haaziri Audit',
      text: 'Aaj office geofence attendance aur field visits ka audit summary kya hai?'
    },
    {
      label: '💰 8% Growth Pool Audit',
      text: 'August month ka 8% growth pool aur incentive ledger transparent breakdown dijiye.'
    }
  ];

  return (
    <div className="space-y-5 pb-20">
      
      {/* Top Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <h2 className="text-lg sm:text-xl font-black text-white">Maya AGI Operations Hub</h2>
          </div>
          <p className="text-xs sm:text-sm text-purple-200">
            Autonomous multi-agent team learning and evolving with daily agency performance data.
          </p>
        </div>

        <button
          onClick={onOpenChat}
          className="tap-target px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
          <span>Maya AI Chat Open Karein</span>
        </button>
      </div>

      {/* A2A Graph Visualizer */}
      <AgentGraphVisualizer onSelectAgent={(id) => setSelectedAgentId(id)} />

      {/* Quick Action Prompts */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Quick Manager Actions (One-Tap Prompts)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                onOpenChat();
                sendMessageToAgent(p.text, {
                  urgentRtoCount: amparoCalls.filter((c) => c.urgent_rto).length,
                  bonusPool: revenueLog.bonus_pool_8pct,
                  bonusPerMember: revenueLog.bonus_per_member
                });
              }}
              className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-left text-xs font-semibold text-slate-200 transition active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Agent Memory Feed & API Keys Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Memory & Synaptic Transmissions Feed */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <History className="w-4 h-4 text-purple-400" />
              <span>Evolution & Shared Brain Memory Feed</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold">{memories.length} Entries</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {memories.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Koi memory log abhi record nahi hua hai.</p>
            ) : (
              memories.map((mem) => (
                <div key={mem.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">
                      {mem.agentId} • {mem.type}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(mem.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{mem.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* API Key Configuration Card (Beginner Friendly) */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200">Groq / OpenRouter API Setup (Free Tier)</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Yahan aap apna Free Groq API Key (<code className="text-emerald-400">gsk_...</code>) ya OpenRouter Free Key paste kar sakte hain. Default app bina key ke bhi full smart simulation ke sath kaam karta hai!
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-2">
              <input
                type="password"
                placeholder="Paste API Key (e.g. gsk_...)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="tap-target w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{keySaved ? 'API Key Saved Successfully! ✅' : 'Save API Key'}</span>
              </button>
            </form>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300">Free API Key Kaise Banayein?</p>
            <p>1. <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-purple-400 underline">console.groq.com</a> par free account banayein.</p>
            <p>2. "API Keys" section me jakar <code className="text-emerald-400">Create API Key</code> par click karein.</p>
            <p>3. Key copy kar ke upar paste kar dein. That's it!</p>
          </div>
        </div>

      </div>

    </div>
  );
}
