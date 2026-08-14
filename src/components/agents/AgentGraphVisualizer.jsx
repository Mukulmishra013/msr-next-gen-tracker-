// Interactive Agent-to-Agent (A2A) Directed Graph & Synapse Visualizer
import React from 'react';
import { useAgents } from '../../context/AgentContext';
import { Sparkles, Zap, Brain, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

export function AgentGraphVisualizer({ onSelectAgent }) {
  const { agents, activeSynapses, selectedAgentId } = useAgents();

  const agentList = Object.values(agents);

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-purple-500/20 bg-slate-900/90 relative overflow-hidden">
      
      {/* Background Grid Pattern & Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Brain className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
              Maya A2A Graph Mesh
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Consensus Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Autonomous multi-agent directed evolution network</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
          <Activity className="w-3.5 h-3.5 text-purple-400 animate-spin-slow" />
          <span className="hidden sm:inline">Synapses:</span>
          <span className="text-purple-300">{activeSynapses.length} Live</span>
        </div>
      </div>

      {/* Live Synapse Event Banner (if active transmissions exist) */}
      {activeSynapses.length > 0 && (
        <div className="mb-4 p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/50 flex items-center gap-2 animate-pulse">
          <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0" />
          <div className="text-xs text-purple-200">
            <span className="font-bold text-white uppercase">{activeSynapses[0].from}</span>
            <ArrowRight className="w-3 h-3 inline mx-1 text-purple-400" />
            <span className="font-bold text-white uppercase">{activeSynapses[0].to}:</span>{' '}
            <span>{activeSynapses[0].summaryHinglish}</span>
          </div>
        </div>
      )}

      {/* Node Grid Layout (LangGraph / Mesh representation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {agentList.map((agent) => {
          const isSelected = agent.id === selectedAgentId;
          const xpPercent = Math.min(100, Math.round((agent.xp / agent.xpToNextLevel) * 100));

          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-purple-950/50 border-purple-400 ring-2 ring-purple-500/30 shadow-lg shadow-purple-900/30'
                  : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800'
              }`}
            >
              {/* Agent Node Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{agent.avatar}</span>
                  <div>
                    <h4 className="font-bold text-xs text-white leading-tight">{agent.name}</h4>
                    <p className="text-[10px] text-purple-300 font-medium">{agent.role}</p>
                  </div>
                </div>
                <span className="bg-slate-800 border border-slate-700 text-amber-300 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                  Lvl {agent.level}
                </span>
              </div>

              {/* XP Progress Bar */}
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>Evolution XP</span>
                  <span className="text-emerald-400">{agent.xp} / {agent.xpToNextLevel}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Agent Specialty Snippet */}
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {agent.specialty}
              </p>
            </button>
          );
        })}
      </div>

    </div>
  );
}
