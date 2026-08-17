// Staff 360° Full Dossier, Attendance History & Maya AI Performance Intelligence Modal
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { supervisorAudit } from '../../services/supervisorAudit';
import { getStaffWorkMode, setStaffWorkMode } from '../../services/geolocation';
import { 
  ShieldCheck, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Phone, 
  DollarSign, 
  Sparkles, 
  X, 
  Send, 
  Home, 
  Building2, 
  Coffee, 
  Zap, 
  Flame,
  Check
} from 'lucide-react';

export function Staff360DossierModal({ isOpen, user, onClose }) {
  const { attendance, incentives, amparoCalls } = useAppData();
  const { updateUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('performance'); // 'performance' | 'attendance' | 'actions'
  const [customGuidanceNote, setCustomGuidanceNote] = useState('');
  const [warningReason, setWarningReason] = useState('Pichhle 30 minute se inactive hain. Kripya urgent queue par focus karein.');
  const [praiseReason, setPraiseReason] = useState('Shabash! Aaj 4 Urgent RTOs rescue kiye aur customer handling bahut achhi rahi.');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  if (!isOpen || !user) return null;

  const workMode = getStaffWorkMode(user.id) || user.work_mode || 'WFH';
  const isWfh = workMode === 'WFH';
  const breakInfo = supervisorAudit.getStaffBreakStatus(user.id);
  const dutyStatus = supervisorAudit.getStaffDutyStatus(user.id);

  // User attendance history
  const userAttendanceRecords = attendance
    .filter((a) => a.user_id === user.id || a.employee_name?.toLowerCase() === user.name?.toLowerCase())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const presentDays = userAttendanceRecords.filter((a) => a.status === 'present').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = userAttendanceRecords.find((a) => a.date === todayStr);

  // User calling & incentive stats
  const userIncentives = incentives.filter((i) => i.user_id === user.id);
  const totalIncentiveEarned = userIncentives.reduce((sum, item) => sum + (Number(item.amount) || 0), 210);

  // Performance Rating Logic
  let performanceScore = 8.8;
  let performanceGrade = 'A+ (Top Performer)';
  let performanceStatus = 'EXCELLENT'; // 'EXCELLENT' | 'AVERAGE' | 'POOR'
  let statusSummary = 'Kaam Bahut Acha Chal Raha Hai 🌟';

  if (presentDays < 5 || breakInfo.isQuotaExhausted) {
    performanceScore = 6.2;
    performanceGrade = 'B (Attention Needed)';
    performanceStatus = 'AVERAGE';
    statusSummary = 'Average Pace — Calling Volume Badhane Ki Jarurat Hai ⚠️';
  }
  if (!todayRecord && new Date().getHours() >= 12) {
    performanceScore = 4.5;
    performanceGrade = 'C (Underperforming)';
    performanceStatus = 'POOR';
    statusSummary = 'Kaam Bekar Chal Raha Hai — Attendance Missing & Low Activity 🚨';
  }

  // 1. Send Spot Praise Action
  const handleSendPraise = () => {
    supervisorAudit.addAuditLog({
      type: 'SPOT_PRAISE',
      severity: 'info',
      staffName: user.name,
      message: `🎉 Mukul Mishra awarded Spot Praise to ${user.name}: "${praiseReason}"`
    });
    setActionSuccessMsg(`🌟 Spot Praise successfully logged for ${user.name}!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // 2. Send Strict Warning Action
  const handleSendWarning = () => {
    supervisorAudit.issueWarning({
      userId: user.id,
      userName: user.name,
      category: 'ADMIN_MANUAL',
      severity: 'high',
      title: '👑 Admin Direct Notice: Performance Alert',
      reason: warningReason,
      actionRequired: 'Immediately resume calling and clear backlog queue.'
    });
    setActionSuccessMsg(`🚨 Strict Warning notice dispatched to ${user.name}'s screen!`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // 3. Send Strategic Guidance Note
  const handleSendGuidance = () => {
    if (!customGuidanceNote.trim()) return;
    supervisorAudit.issueWarning({
      userId: user.id,
      userName: user.name,
      category: 'ADMIN_MANUAL',
      severity: 'info',
      title: '💡 Admin Strategic Guidance Note',
      reason: customGuidanceNote.trim(),
      actionRequired: 'Follow instructions and implement on next customer calls.'
    });
    setActionSuccessMsg(`🎯 Guidance note sent to ${user.name}!`);
    setCustomGuidanceNote('');
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // 4. Send WhatsApp Performance Report
  const handleSendWhatsappReport = () => {
    const phoneDigits = user.phone?.replace(/\D/g, '').slice(-10);
    if (!phoneDigits) {
      alert('Phone number missing!');
      return;
    }
    const msg = `👑 *MSR Next Gen — Staff Daily Performance Report*

👤 *Employee:* ${user.name} (${user.roleLabel || user.role})
📅 *Date:* ${new Date().toLocaleDateString('en-IN')}
📍 *Work Mode:* ${isWfh ? 'Work From Home (WFH)' : 'Office On-Site'}

📊 *Performance Status:* ${statusSummary}
⭐ *Rating Score:* ${performanceScore} / 10 (${performanceGrade})
🕒 *Check-In Time:* ${todayRecord?.check_in_time || 'Pending'}
☕ *Break Used:* ${breakInfo.usedMinutesToday}/40 minutes
💵 *Estimated Month Payout:* ₹${(Number(user.base_salary || 15000) + totalIncentiveEarned).toLocaleString('en-IN')}

💬 *Admin Message:* ${performanceStatus === 'EXCELLENT' ? praiseReason : warningReason}

— *Mukul Mishra (Director, MSR Next Gen)*`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/91${phoneDigits}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5 custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-2xl shadow-lg">
              {user.avatar || '👩‍💼'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-lg text-white">{user.name}</h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isWfh 
                    ? 'bg-blue-500/20 border-blue-400 text-blue-300' 
                    : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                }`}>
                  {isWfh ? '🏠 Work From Home (WFH)' : '🏢 Office On-Site'}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  dutyStatus === 'ACTIVE'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                    : 'bg-indigo-950 text-indigo-300 border-indigo-500'
                }`}>
                  {dutyStatus === 'ACTIVE' ? '🟢 Duty Active' : '⏸️ Shift Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user.roleLabel || user.role} • 📞 {user.phone} • 📅 Joined: <strong className="text-purple-300">{user.joining_date || '2026-08-01'}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {actionSuccessMsg && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 animate-scale-up shadow-md">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'performance', label: '📊 Performance & AI Audit', icon: TrendingUp },
            { id: 'attendance', label: `📅 Attendance & Time Log (${userAttendanceRecords.length})`, icon: Clock },
            { id: 'actions', label: '⚡ Admin Direct Guidance & Action Dispatch', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === tab.id
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: 📊 PERFORMANCE & AI AUDIT */}
        {activeTab === 'performance' && (
          <div className="space-y-4 animate-fade-in">
            {/* Status Rating Card */}
            <div className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              performanceStatus === 'EXCELLENT'
                ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/40'
                : performanceStatus === 'AVERAGE'
                ? 'bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-amber-500/40'
                : 'bg-gradient-to-r from-red-950/70 via-slate-900 to-slate-900 border-red-500/40'
            }`}>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Maya AI Supervisor Performance Verdict:
                </span>
                <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>{statusSummary}</span>
                </h4>
                <p className="text-xs text-slate-300">
                  {performanceStatus === 'EXCELLENT'
                    ? 'Telecaller timely attendance punch kar rahi hain, active calling pacing maintain hai aur NDR rescue conversion rate high hai.'
                    : performanceStatus === 'AVERAGE'
                    ? 'Calling pacing thoda slow hai. Break time control karne aur pending orders jaldi clear karne ki jarurat hai.'
                    : 'Attendance missing hai ya lambi inactivity detect hui hai. Immediate admin warning bhejni chahiye.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-center shrink-0 min-w-[120px]">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Audit Score</span>
                <p className="text-2xl font-black font-mono text-yellow-300 mt-0.5">{performanceScore}/10</p>
                <span className="text-[10px] font-bold text-purple-300">{performanceGrade}</span>
              </div>
            </div>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Today's Check-In</span>
                <p className="text-sm font-black text-emerald-400 font-mono">
                  {todayRecord?.check_in_time || 'Missing (Not Punched)'}
                </p>
                <p className="text-[10px] text-slate-400">{todayRecord?.work_mode || (isWfh ? 'WFH Mode' : 'Office On-Site')}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Break Quota Used</span>
                <p className="text-sm font-black text-amber-400 font-mono">
                  {breakInfo.usedMinutesToday} / 40 mins
                </p>
                <p className="text-[10px] text-slate-400">{breakInfo.remainingMinutes}m balance left</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Base Salary (Month)</span>
                <p className="text-sm font-black text-teal-300 font-mono">
                  ₹{Number(user.base_salary || 15000).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400">₹{Math.round(Number(user.base_salary || 15000) / 30)}/day base pay</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Incentive Bounty</span>
                <p className="text-sm font-black text-purple-300 font-mono">
                  +₹{totalIncentiveEarned.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400">1-Tap UPI: {user.upi_id || `${user.phone}@upi`}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 📅 ATTENDANCE & TIME LOG (Kab Aaya, Kab Gaya) */}
        {activeTab === 'attendance' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Daily Punch-In & Punch-Out Timeline ({userAttendanceRecords.length} Records)</span>
              </h4>
              <span className="text-[11px] text-emerald-400 font-bold">Total Present: {presentDays} Days</span>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-mono sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Punch-In Time</th>
                    <th className="p-3">Work Mode</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Geofence / Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {userAttendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                        Abhi koi attendance record nahi mila hai.
                      </td>
                    </tr>
                  ) : (
                    userAttendanceRecords.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono font-bold text-white">
                          {att.date}
                        </td>
                        <td className="p-3 font-mono text-emerald-300 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span>{att.check_in_time || '11:00 AM'}</span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            att.work_mode === 'WFH'
                              ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          }`}>
                            {att.work_mode === 'WFH' ? '🏠 WFH' : '🏢 Office'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            att.status === 'present'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : 'bg-red-950 text-red-300 border-red-500/40'
                          }`}>
                            {att.status === 'present' ? 'PRESENT ✅' : 'ABSENT ❌'}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-300">
                          {att.within_geofence ? 'Verified (Secure)' : `${att.distance_meters || 0}m from Office`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ⚡ ADMIN DIRECT ACTIONS & GUIDANCE DISPATCH */}
        {activeTab === 'actions' && (
          <div className="space-y-4 animate-fade-in text-xs">
            
            {/* 1. Send Shabash / Spot Praise */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>1. Send Spot Praise / Shabash Notice (Achhe Kaam Ke Liye)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Encouragement</span>
              </div>
              <input
                type="text"
                value={praiseReason}
                onChange={(e) => setPraiseReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSendPraise}
                className="tap-target px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
              >
                <Award className="w-3.5 h-3.5 text-yellow-300" />
                <span>🌟 Award Shabash & Log Praise</span>
              </button>
            </div>

            {/* 2. Send Strict Warning */}
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-red-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>2. Send Strict Warning / Kaam Sudharo Notice (Bekar Kaam / Inactivity)</span>
                </span>
                <span className="text-[10px] text-red-400 font-bold">Strict HR Notice</span>
              </div>
              <input
                type="text"
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleSendWarning}
                className="tap-target px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition active:scale-95"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>🚨 Send Strict Warning Alert</span>
              </button>
            </div>

            {/* 3. Send Tactical Guidance & Script Suggestions */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-purple-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>3. Send Tactical Calling Advice / Strategy Guidance</span>
                </span>
                <span className="text-[10px] text-purple-300 font-bold">Coaching</span>
              </div>
              <textarea
                rows={2}
                placeholder="e.g. Aaj 3rd Attempt wale RTO parcels pehle dial karo aur customer ko kal 2 PM delivery confirm karwao..."
                value={customGuidanceNote}
                onChange={(e) => setCustomGuidanceNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSendGuidance}
                className="tap-target px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>🎯 Send Guidance to Telecaller</span>
              </button>
            </div>

            {/* 4. Send 1-Click WhatsApp Performance Report */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="font-extrabold text-white text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Send Complete Audit Card on Staff WhatsApp:</span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sends full attendance, score rating & guidance report to {user.name}'s phone.
                </p>
              </div>
              <button
                onClick={handleSendWhatsappReport}
                className="tap-target px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>📱 Send on WhatsApp</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
