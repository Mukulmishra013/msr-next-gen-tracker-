// Generic Custom Role Dashboard (for Media Buyer, Graphic Designer, etc.)
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Briefcase, Flame, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export function CustomRoleDashboard({ onOpenChat }) {
  const { currentUser } = useAuth();
  const { incentives } = useAppData();

  const userIncentives = incentives.filter((i) => i.user_id === currentUser.id);
  const totalIncentive = userIncentives.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-5 pb-20">
      
      {/* Top Welcome */}
      <div className="glass-card p-5 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-black text-base text-white flex items-center gap-2">
            <span>{currentUser.avatar || '💼'}</span>
            <span>{currentUser.name} ({currentUser.roleLabel || currentUser.role})</span>
          </h3>
          <p className="text-xs text-purple-300">Custom Role Operations & KPI Workspace</p>
        </div>

        <button
          onClick={onOpenChat}
          className="tap-target px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Ask Maya AI</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/30 bg-slate-950">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Base Salary</p>
          <p className="text-xl font-black text-white mt-1">₹{currentUser.base_salary?.toLocaleString('en-IN')}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-slate-950">
          <p className="text-[10px] text-amber-300 font-bold uppercase">Live Incentive</p>
          <p className="text-xl font-black text-amber-400 mt-1">₹{totalIncentive.toLocaleString('en-IN')}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-blue-500/30 bg-slate-950">
          <p className="text-[10px] text-blue-300 font-bold uppercase">Daily Streak</p>
          <p className="text-xl font-black text-blue-400 mt-1">{currentUser.streak || 1} Days 🔥</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-purple-500/30 bg-slate-950">
          <p className="text-[10px] text-purple-300 font-bold uppercase">KPI Status</p>
          <p className="text-xl font-black text-emerald-400 mt-1">On Track ✅</p>
        </div>
      </div>

      {/* Tasks & Direct Work Section */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
        <h4 className="font-extrabold text-sm text-white">Daily Operational Deliverables</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Aapke role ke KPIs Maya Ops Director dwara live optimize ho rahe hain. Agar koi custom task tracker ya report submit karni ho, toh Maya AI drawer me direct update karein.
        </p>
      </div>

    </div>
  );
}
