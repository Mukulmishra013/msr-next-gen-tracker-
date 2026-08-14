// Conversational Multi-Agent Drawer (Maya AGI)
import React, { useState, useRef, useEffect } from 'react';
import { useAgents } from '../../context/AgentContext';
import { useAppData } from '../../context/AppDataContext';
import { 
  X, 
  Send, 
  Sparkles, 
  Trash2, 
  Bot, 
  User, 
  BrainCircuit, 
  ArrowRight,
  Flame
} from 'lucide-react';

export function MayaChatDrawer({ isOpen, onClose }) {
  const { 
    agents, 
    selectedAgentId, 
    setSelectedAgentId, 
    chatMessages, 
    isThinking, 
    sendMessageToAgent, 
    clearChat 
  } = useAgents();

  const { amparoCalls, msrLeads, revenueLog } = useAppData();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const activeAgent = agents[selectedAgentId] || agents.ops_manager;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessageToAgent(inputText, {
      urgentRtoCount: amparoCalls.filter((c) => c.urgent_rto).length,
      pendingCallsCount: amparoCalls.filter((c) => c.status === 'pending_confirmation').length,
      bonusPool: revenueLog.bonus_pool_8pct,
      bonusPerMember: revenueLog.bonus_per_member
    });
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-slate-700/80 w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-xl">
              {activeAgent.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white">{activeAgent.name}</h3>
                <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                  Lvl {activeAgent.level}
                </span>
              </div>
              <p className="text-[11px] text-purple-300 font-medium">{activeAgent.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Agent Selector Bar */}
        <div className="flex items-center gap-1.5 p-2 bg-slate-950 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
          {Object.values(agents).map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                agent.id === selectedAgentId
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{agent.avatar}</span>
              <span>{agent.name.split(' ')[1] || agent.name}</span>
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-500/30 flex items-center justify-center text-sm flex-shrink-0">
                    {msg.agentAvatar || '🤖'}
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  {!isUser && (
                    <p className="font-bold text-[10px] text-purple-300 mb-1">{msg.agentName}</p>
                  )}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <p className={`text-[9px] mt-1.5 text-right ${isUser ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </p>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-sm flex-shrink-0">
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex items-center gap-2 text-purple-400 text-xs py-2">
              <Sparkles className="w-4 h-4 animate-spin-slow text-yellow-300" />
              <span>{activeAgent.name} sochte hue answer prepare kar rahe hain...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask ${activeAgent.name} in simple Hindi/Hinglish...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="tap-target px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center transition active:scale-95 shadow-md shadow-purple-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
