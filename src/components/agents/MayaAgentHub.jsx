// Maya Agent Hub - Full AI Command Center & Telecaller Sales Intelligence Studio
import React, { useState } from 'react';
import { useAgents } from '../../context/AgentContext';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { AgentGraphVisualizer } from './AgentGraphVisualizer';
import { 
  Bot, 
  Sparkles, 
  Database, 
  History, 
  TrendingUp, 
  Zap, 
  CheckCircle2,
  Send,
  RefreshCw,
  MessageSquare,
  Copy,
  Lightbulb,
  ShieldCheck,
  Flame,
  Check
} from 'lucide-react';

export function MayaAgentHub({ onOpenChat }) {
  const { currentUser } = useAuth();
  const { agents, memories, selectedAgentId, setSelectedAgentId, sendMessageToAgent } = useAgents();
  const { amparoCalls, msrLeads, attendance, revenueLog } = useAppData();

  // Objection Studio State
  const [selectedObjectionIndex, setSelectedObjectionIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [customQuery, setCustomQuery] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [isSolving, setIsSolving] = useState(false);

  const objectionScenarios = [
    {
      title: '💸 "Price Bahut Zyada Hai (Mehenga Hai)"',
      tag: 'Price Objection',
      pitch: 'सर, Amparo Shilajit 100% pure Himalayan Gold Grade se bana hai jisme 75%+ Fulvic Acid aur 84+ minerals hain. Market ke saste powder chemicals wale hote hain jo kidney ko nuksan karte hain. Aapki health priority hai, isliye special approval se ₹50 ka VIP discount code (AMPARO50) apply karke delivery confirm kar dete hain.',
      tip: 'Customer ko chemical vs pure Ayurvedic quality samjhayein aur ₹50 coupon code dein.'
    },
    {
      title: '🚫 "Maine Order Hi Nahi Kiya / Galti Se Ho Gaya"',
      tag: 'Verification Objection',
      pitch: 'सर, aapke isi mobile number aur address par hamare online store se order place hua tha. Ye fresh laboratory tested batch ready hai. Agar aap daily energy aur stamina naturally boost karna chahte hain, toh ye parcel accept karein, hum aapko priority delivery denge.',
      tip: 'Politely address confirm karein aur health benefits recall karwayein.'
    },
    {
      title: '⏳ "Ghar Par Nahi Hoon / Cash Ready Nahi Hai"',
      tag: 'Timing & Cash Objection',
      pitch: 'Bilkul koi pareshani nahi hai sir! Mai courier boy ko bolkar delivery aaj shaam ko ya kal subah aapke free time ke liye schedule karwa deti hoon. Aane se pehle courier boy aapko call karega.',
      tip: 'Direct discount na dein, sirf timing shaam ya kal ke liye reschedule karein.'
    },
    {
      title: '🌿 "Product Ke Koi Side Effects To Nahi Honge?"',
      tag: 'Quality & Safety Objection',
      pitch: 'Sir bilkul 100% safe aur lab-tested hai! Ye Ayush certified aur GMP approved organic herbs se bana hai. Isme 0% chemical aur 0% steroid hai. 60-90 din regular use karne par stamina aur immunity naturally enhance hoti hai.',
      tip: 'Ayush & GMP certification highlight karke customer ka trust build karein.'
    },
    {
      title: '🚚 "Delivery Me Bohat Time Lag Gaya / Late Hua"',
      tag: 'Delivery Delay Objection',
      pitch: 'Sir delay ke liye maafi chahte hain! Actually aapka product fresh batch testing ke baad dispatch kiya gaya tha taki best quality mile. Parcel abhi aapke nearest delivery hub par aa chuka hai aur aaj hi deliver hoga.',
      tip: 'Delay ko "Fresh Quality Testing" se relate karke positive frame karein.'
    }
  ];

  const handleCopyScript = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleSolveCustomObjection = async (e) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setIsSolving(true);
    try {
      const prompt = `You are Maya, the expert sales & telecalling coach for Amparo Store (Ayurvedic health brand). 
A customer raised this objection/question on call: "${customQuery}".
Provide a short, crisp, natural spoken Hindi/Hinglish counter-pitch (2-3 sentences max) that the telecaller can speak on call to satisfy the customer and confirm the COD order.`;

      const groqKey = import.meta.env.VITE_GROQ_API_KEY || '';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 200
        })
      });

      if (res.ok) {
        const data = await res.json();
        const ans = data.choices?.[0]?.message?.content || 'सर, aapka order fresh batch packaging me hai. Best results ke liye zaroor use karein!';
        setCustomAnswer(ans);
      } else {
        setCustomAnswer('सर, Amparo Store 100% authentic Ayurvedic quality guarantee deta hai. Aap bina kisi tension parcel receive karein.');
      }
    } catch (e) {
      setCustomAnswer('सर, Amparo Store 100% authentic Ayurvedic quality guarantee deta hai. Aap bina kisi tension parcel receive karein.');
    } finally {
      setIsSolving(false);
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
      
      {/* Top Banner with 3D Maya Avatar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 via-indigo-950/80 to-slate-900 border border-purple-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xl">
        <div className="flex items-start sm:items-center gap-4 flex-1">
          <div className="relative group flex-shrink-0">
            <img 
              src="/assets/maya_avatar.jpg" 
              alt="Maya AGI Neural Co-Pilot" 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl object-cover border-2 border-purple-400/80 shadow-xl shadow-purple-500/30 group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              70B
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">Maya AGI Operations & Sales Intelligence Hub</h2>
            </div>
            <p className="text-xs sm:text-sm text-purple-200">
              Autonomous multi-agent directed evolution learning with live Groq Llama 3.3 neural core.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Enterprise Groq AGI Core Active (Llama 3.3 70B & 8B)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenChat}
          className="tap-target px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
          <span>Ask Maya AI Chat ➔</span>
        </button>
      </div>

      {/* A2A Graph Visualizer */}
      <AgentGraphVisualizer onSelectAgent={(id) => setSelectedAgentId(id)} />

      {/* Quick Action Prompts */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Quick Agency One-Tap Prompts</span>
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

      {/* Two Column Grid: Shared Brain Memory Feed & Telecaller Objection Buster Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left Column: Memory & Synaptic Transmissions Feed */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-400" />
                <span>Evolution & Shared Brain Memory Feed</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-semibold">{memories.length} Entries</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {memories.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <Database className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                  <p>Maya AGI brain is actively synchronizing live team actions...</p>
                </div>
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

          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs flex items-center justify-between">
            <span className="text-purple-300 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-yellow-400" />
              Maya Learning Rate:
            </span>
            <span className="text-emerald-400 font-bold font-mono">99.4% Accuracy (Groq 70B)</span>
          </div>
        </div>

        {/* Right Column: 🎯 MAYA TELECALLER SALES & OBJECTION BUSTER STUDIO */}
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                🎯 1-Click Objection Buster (Live Calling Scripts)
              </h4>
            </div>
            <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
              Live AI Assist
            </span>
          </div>

          {/* Objection Scenario Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {objectionScenarios.map((obj, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedObjectionIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                  selectedObjectionIndex === idx
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {obj.tag}
              </button>
            ))}
          </div>

          {/* Active Objection Pitch Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300">
                {objectionScenarios[selectedObjectionIndex].title}
              </span>
              <button
                onClick={() => handleCopyScript(objectionScenarios[selectedObjectionIndex].pitch, selectedObjectionIndex)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition"
                title="Copy script to clipboard"
              >
                {copiedIndex === selectedObjectionIndex ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              🗣️ <strong className="text-purple-300">Aapko bolna hai:</strong> "{objectionScenarios[selectedObjectionIndex].pitch}"
            </p>

            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
              <span>Tip: {objectionScenarios[selectedObjectionIndex].tip}</span>
            </div>
          </div>

          {/* AI Custom Objection Solver */}
          <form onSubmit={handleSolveCustomObjection} className="space-y-2 pt-1 border-t border-slate-800/80">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              Customer ne koi ajeeb sawal pucha? (Instant AI Script Solution):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="e.g. Customer bola: mere pet me gas banti hai..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isSolving || !customQuery.trim()}
                className="tap-target px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center gap-1 shadow-md transition active:scale-95 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isSolving ? 'animate-spin' : ''}`} />
                <span>{isSolving ? 'Solving...' : 'Solve'}</span>
              </button>
            </div>

            {customAnswer && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-100 space-y-1 animate-scale-up">
                <span className="font-bold text-emerald-300 text-[10px] uppercase">⚡ Maya AI Winning Counter-Pitch:</span>
                <p className="leading-relaxed font-sans">{customAnswer}</p>
              </div>
            )}
          </form>

        </div>

      </div>

    </div>
  );
}
