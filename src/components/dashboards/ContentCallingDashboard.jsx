// Content & Calling Dashboard (Real Amparo Orders & Shiprocket RTO Queue)
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  PhoneCall, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  TrendingUp, 
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Share2,
  CheckSquare,
  Plus,
  PackageCheck
} from 'lucide-react';

export function ContentCallingDashboard({ onOpenChat }) {
  const { currentUser } = useAuth();
  const { amparoCalls, msrLeads, incentives, updateCallStatus, convertLead } = useAppData();
  const [activeCallTab, setActiveCallTab] = useState('all');
  const [checklist, setChecklist] = useState({
    reel_posted: false,
    story_posted: false,
    community_post: false,
    whatsapp_broadcast: false
  });

  const userIncentives = incentives.filter((i) => i.user_id === currentUser.id);
  const totalIncentive = userIncentives.reduce((sum, item) => sum + item.amount, 0);

  const sortedCalls = [...amparoCalls].sort((a, b) => (b.urgent_rto ? 1 : 0) - (a.urgent_rto ? 1 : 0));
  const filteredCalls = sortedCalls.filter((c) => {
    if (activeCallTab === 'urgent_rto') return c.urgent_rto;
    if (activeCallTab === 'pending') return c.status === 'pending_confirmation';
    if (activeCallTab === 'saved') return c.status === 'rto_saved' || c.status === 'confirmed';
    return true;
  });

  const urgentCount = amparoCalls.filter((c) => c.urgent_rto).length;
  const pendingLeads = msrLeads.filter((l) => l.status !== 'converted');

  const toggleChecklist = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Live Incentive Counter & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Live Incentive</span>
            <Flame className="w-4 h-4 text-emerald-400 animate-bounce-subtle" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{totalIncentive.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Real-time ledger credited</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider">Urgent RTOs</span>
            <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{urgentCount}</p>
          <p className="text-[10px] text-red-300 font-semibold mt-0.5">Shiprocket RTO alerts</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Active Leads</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{pendingLeads.length}</p>
          <p className="text-[10px] text-blue-300 font-semibold mt-0.5">₹400 per conversion</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Logged In</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-sm font-black text-white mt-1 truncate">{currentUser.name}</p>
          <p className="text-[10px] text-purple-300 font-semibold mt-0.5">{currentUser.roleLabel || currentUser.role}</p>
        </div>
      </div>

      {/* Amparo Calling Queue */}
      <div className="glass-card rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Amparo Orders & Shiprocket Live Queue</span>
            </h3>
            <p className="text-xs text-slate-400">Live Shiprocket webhook & Shopify orders feed</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `All Orders (${amparoCalls.length})` },
              { id: 'urgent_rto', label: `🚨 Urgent RTO (${urgentCount})` },
              { id: 'pending', label: 'Pending' },
              { id: 'saved', label: 'Saved / Confirmed' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCallTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeCallTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calls List or Empty State */}
        {filteredCalls.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
            <PackageCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm text-white">No active orders in this queue</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Jab Shiprocket se naya order dispatch ya RTO update aayega, wo real-time me yahan display hoga!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCalls.map((call) => (
              <div
                key={call.id}
                className={`p-4 rounded-2xl border transition ${
                  call.urgent_rto
                    ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {call.urgent_rto && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">
                          URGENT RTO
                        </span>
                      )}
                      <span className="font-extrabold text-sm text-white">{call.customer_name}</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">₹{call.amount}</span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{call.product}</p>
                    <p className="text-[11px] text-slate-400">{call.notes}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`tel:${call.phone}`}
                      className="tap-target px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call ({call.phone})</span>
                    </a>

                    <button
                      onClick={() => updateCallStatus(call.id, 'confirmed')}
                      className="tap-target px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Confirm</span>
                    </button>

                    <button
                      onClick={() => updateCallStatus(call.id, 'rto_saved')}
                      className="tap-target px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 transition active:scale-95"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>RTO Saved (+₹50)</span>
                    </button>

                    <button
                      onClick={() => updateCallStatus(call.id, 'rto_lost')}
                      className="tap-target px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1 transition active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>Lost</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
