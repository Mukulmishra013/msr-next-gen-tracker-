// Maya Autonomous AI HR & Real Live Supervisor Command Center
import React, { useState, useEffect } from 'react';
import { mayaSupervisorAgent } from '../../services/mayaSupervisorAgent';
import { telemetryTracker } from '../../services/telemetryTracker';
import { notificationService } from '../../services/notificationService';
import { supervisorAuditService } from '../../services/supervisorAudit';
import { AdminPushBroadcastModal } from './AdminPushBroadcastModal';
import { 
  Bot, 
  Sparkles, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Megaphone, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Coffee, 
  Flame,
  Volume2,
  Send,
  Eye,
  RefreshCw,
  Compass,
  FileText
} from 'lucide-react';

export function MayaSupervisorDashboard({ staffList = [] }) {
  const [pulseCount, setPulseCount] = useState(0);
  const [isShiftActive, setIsShiftActive] = useState(mayaSupervisorAgent.isWithinShiftHours());
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [selectedStaffDetail, setSelectedStaffDetail] = useState(null);
  const [strategicPlan, setStrategicPlan] = useState(mayaSupervisorAgent.getLatestStrategicPlan());

  // Default active team members if none passed
  const teamMembers = staffList.length > 0 ? staffList : [
    { id: 'usr_priya_telecaller', name: 'Priya Singh', role: 'Telecaller & Support' },
    { id: 'usr_rahul_telecaller', name: 'Rahul Sharma', role: 'Calling Agent' }
  ];

  useEffect(() => {
    mayaSupervisorAgent.init();
    const unsub = mayaSupervisorAgent.subscribe(() => {
      setPulseCount((c) => c + 1);
      setIsShiftActive(mayaSupervisorAgent.isWithinShiftHours());
      setStrategicPlan(mayaSupervisorAgent.getLatestStrategicPlan());
    });
    return unsub;
  }, []);

  const handleManualPulse = async () => {
    await mayaSupervisorAgent.runAutonomousSupervisorPulse();
    setPulseCount((c) => c + 1);
    notificationService.playSuccessChime();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Live Status Strip */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-600/40">
              <Bot className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">Maya Autonomous AI HR & Live Supervisor</h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isShiftActive 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 animate-pulse'
                    : 'bg-amber-950 text-amber-300 border-amber-500/60'
                }`}>
                  {isShiftActive ? '🟢 ACTIVE SHIFT (11 AM - 5 PM)' : '🌙 OFF-DUTY STRATEGIC MODE'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Every 20 minutes autonomous telemetry audit • Data-driven dynamic task dispatch • Voice audio alerts
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition active:scale-95"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>👑 Instant Push Broadcast</span>
            </button>

            <button
              onClick={handleManualPulse}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
              title="Run 20-Min Audit Pulse Now"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
              <span>Trigger Pulse</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live Team Telemetry & Dynamic Task Scorecard */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Live 20-Min Team Telemetry & Dynamic Task Assignment</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Pulse Audit Cycle: Every 20 mins</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamMembers.map((member) => {
            const stats = telemetryTracker.getLiveProductivityStats(member.id, 20);
            const guidance = mayaSupervisorAgent.getSupervisorGuidance(member.id);
            const breakStatus = supervisorAuditService.getStaffBreakStatus(member.id);

            return (
              <div 
                key={member.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 transition space-y-3 shadow-lg"
              >
                {/* Member Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center font-bold text-sm text-purple-300">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-white">{member.name}</p>
                      <p className="text-[11px] text-slate-400">{member.role}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="text-right">
                    {breakStatus.isOnBreak ? (
                      <span className="bg-amber-950 text-amber-300 border border-amber-500/50 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-amber-400" /> On Break ({breakStatus.usedMinutesToday}m)
                      </span>
                    ) : stats.idleMinutes >= 20 ? (
                      <span className="bg-red-950 text-red-300 border border-red-500 text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-400" /> {stats.idleMinutes}m IDLE ALERT
                      </span>
                    ) : (
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Active Working
                      </span>
                    )}
                  </div>
                </div>

                {/* 20-Min Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">20m Clicks</span>
                    <span className="text-sm font-black text-white font-mono">{stats.clickCountInLast20Min}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Productivity</span>
                    <span className={`text-sm font-black font-mono ${
                      stats.productivityScore >= 70 ? 'text-emerald-400' : stats.productivityScore >= 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {stats.productivityScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Idle Timer</span>
                    <span className={`text-sm font-black font-mono ${stats.idleMinutes > 15 ? 'text-red-400' : 'text-slate-300'}`}>
                      {stats.idleMinutes}m
                    </span>
                  </div>
                </div>

                {/* Last Clicked Element */}
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950/40 px-2.5 py-1 rounded-lg border border-slate-800/40">
                  <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="truncate">Last Action: <strong className="text-slate-200">{stats.lastAction}</strong></span>
                </div>

                {/* Maya AI Dynamic Directive (NOT static) */}
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300 flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-yellow-300" /> Maya AI Live Directive:
                    </span>
                    {guidance && (
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        Target: {guidance.targetFocus} (+₹{guidance.incentiveBoost})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {guidance ? guidance.adviceHindi : 'Shift start hote hi Maya AI live telemetry ke according real-time guidance assign karegi.'}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Off-Duty Strategic Business Evolution Briefing */}
      {strategicPlan && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>{strategicPlan.title}</span>
            </h3>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/40">
              Date: {strategicPlan.date}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{strategicPlan.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {strategicPlan.keyPillars.map((p, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-xs text-purple-300">{p.pillar}</p>
                <p className="text-[11px] text-slate-400 leading-tight">💡 {p.insight}</p>
                <p className="text-[11px] text-emerald-300 font-semibold pt-1">🎯 Action: {p.action}</p>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-xs font-bold text-indigo-200 text-center">
            {strategicPlan.tomorrowGoal}
          </div>
        </div>
      )}

      {/* Admin Push Broadcast Modal */}
      {showBroadcastModal && (
        <AdminPushBroadcastModal
          onClose={() => setShowBroadcastModal(false)}
          staffList={teamMembers}
        />
      )}

    </div>
  );
}
