// Owner & Director Command Center (Revenue, Growth Pool, Attendance, UPI Payroll & Employee Management)
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAgents } from '../../context/AgentContext';
import { SalaryBreakdownCard } from '../payroll/SalaryBreakdownCard';
import { EmployeeManagement } from '../admin/EmployeeManagement';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  RefreshCw,
  Gift,
  UserCheck
} from 'lucide-react';

export function OwnerDashboard({ onOpenUpiModal, onOpenChat }) {
  const { amparoCalls, msrLeads, videos, fieldVisits, attendance, revenueLog, payroll } = useAppData();
  const { sendMessageToAgent } = useAgents();
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState('');
  const [activeOwnerTab, setActiveOwnerTab] = useState('overview'); // 'overview' | 'employees' | 'payroll'

  // Calculations
  const totalCalls = amparoCalls.length;
  const savedRtoCount = amparoCalls.filter((c) => c.status === 'rto_saved').length;
  const totalRtoAttempted = amparoCalls.filter((c) => c.call_type === 'RTO Rescue').length || 1;
  const rtoRecoveryRate = totalRtoAttempted > 0 ? Math.round((savedRtoCount / totalRtoAttempted) * 100) : 0;

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const outsideOfficeCount = attendance.filter((a) => a.status === 'outside_office').length;

  const handleGenerateAiSummary = async () => {
    setAiSummaryLoading(true);
    try {
      const summary = `👑 **MSR Next Gen — Mukul Mishra Admin Brief**
• **Revenue & Growth:** Current Revenue ₹${revenueLog.total_revenue?.toLocaleString('en-IN')}. 8% Growth bonus pool ₹${revenueLog.bonus_pool_8pct} team ledger me active hai.
• **Attendance & Geofence:** ${presentCount} team members checked in inside 200m GKP office geofence. ${fieldVisits.length} field visits verified with GPS coordinates.
• **Logistics & Orders:** Total active orders in queue: ${totalCalls}.
• **Team Operations:** Admin panel active for employee creation and automated UPI salary settlements.`;

      setAiSummaryText(summary);
      sendMessageToAgent('Generate executive brief for Mukul Mishra', {
        revenue: revenueLog,
        attendance,
        rtoRecoveryRate
      });
    } finally {
      setAiSummaryLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Welcome Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <h2 className="text-lg sm:text-xl font-black text-white">Mukul Mishra Admin Control Center</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Real Employee Management, GPS Haaziri, Live Shiprocket Queue & 1-Tap UPI Payroll.
          </p>
        </div>

        <button
          onClick={handleGenerateAiSummary}
          disabled={aiSummaryLoading}
          className="tap-target px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
        >
          {aiSummaryLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating AI Executive Summary...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
              <span>Generate AI Weekly Summary</span>
            </>
          )}
        </button>
      </div>

      {/* AI Summary Card (if generated) */}
      {aiSummaryText && (
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-purple-500/40 bg-purple-950/30 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Maya AI Strategic Brief (Hinglish)</span>
            </h4>
            <button
              onClick={() => onOpenChat()}
              className="text-[11px] text-purple-300 font-bold hover:underline"
            >
              Discuss in Chat ➔
            </button>
          </div>
          <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
            {aiSummaryText}
          </div>
        </div>
      )}

      {/* Admin Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'overview', label: '📊 Financial & Operations KPI' },
          { id: 'employees', label: '👥 Employee & Profile Control' },
          { id: 'payroll', label: '💸 UPI Payroll & Growth Pool' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveOwnerTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeOwnerTab === tab.id
                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeOwnerTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">August Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{revenueLog.total_revenue?.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">+₹{revenueLog.growth_amount?.toLocaleString('en-IN')} Growth</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">8% Growth Pool</span>
                <Gift className="w-4 h-4 text-amber-400 animate-bounce-subtle" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{revenueLog.bonus_pool_8pct?.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-amber-300 font-semibold mt-0.5">₹{revenueLog.bonus_per_member?.toLocaleString('en-IN')} / member split</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">GPS Attendance</span>
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">{presentCount} Present</p>
              <p className="text-[10px] text-blue-300 font-semibold mt-0.5">{outsideOfficeCount} Outside 200m Geofence</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Active Queue</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">{totalCalls} Orders</p>
              <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Shiprocket webhook linked</p>
            </div>
          </div>

          <SalaryBreakdownCard onOpenUpiModal={onOpenUpiModal} />
        </>
      )}

      {/* Employees Management Tab */}
      {activeOwnerTab === 'employees' && <EmployeeManagement />}

      {/* Payroll Tab */}
      {activeOwnerTab === 'payroll' && <SalaryBreakdownCard onOpenUpiModal={onOpenUpiModal} />}

    </div>
  );
}
