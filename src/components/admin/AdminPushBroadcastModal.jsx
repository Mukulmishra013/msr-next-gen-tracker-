// Admin Instant Push Broadcast Modal with Loud Chime, Voice & Multi-Device Sync
import React, { useState } from 'react';
import { notificationService } from '../../services/notificationService';
import { 
  Megaphone, 
  X, 
  Volume2, 
  Radio, 
  Send, 
  BellRing, 
  Users, 
  Sparkles,
  Flame,
  AlertTriangle,
  Info
} from 'lucide-react';

export function AdminPushBroadcastModal({ onClose, staffList = [] }) {
  const [broadcastTitle, setBroadcastTitle] = useState('👑 Admin Important Directive');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetUser, setTargetUser] = useState('ALL');
  const [soundType, setSoundType] = useState('broadcast');
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const quickTemplates = [
    {
      title: '🚨 Urgent: NDR Re-Attempt Drive',
      msg: 'Team attention! Sabhi log abhi "🚨 Actionable NDR" queue clear karein. Har delivered order par +₹50 verified cash incentive mil raha hai.',
      sound: 'alert'
    },
    {
      title: '🔥 Afternoon Pacing Boost',
      msg: 'Shift ke last 2 ghante bache hain! Speed badhayein aur aaj ka 100% daily target complete karke maximum bounty earn karein!',
      sound: 'broadcast'
    },
    {
      title: '☕ Daily Break Reminder',
      msg: 'Dopahar ka 15-minute tea break slot open hai. Jinhe break lena ho wo Break button press karke 40m wallet se rest le sakte hain.',
      sound: 'success'
    },
    {
      title: '🏆 Target Achieved Congratulations',
      msg: 'Congratulations team! Aaj ka COD confirmation target 90%+ cross ho gaya hai. Keep it up!',
      sound: 'coin'
    }
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsSending(true);
    try {
      await notificationService.sendAdminBroadcast({
        title: broadcastTitle,
        body: broadcastMessage,
        targetUserId: targetUser,
        adminName: 'Mukul Mishra'
      });

      setSuccessMsg('✅ Broadcast instantly sent to all devices with loud sound & Hindi voice!');
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error('Broadcast send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectTemplate = (tpl) => {
    setBroadcastTitle(tpl.title);
    setBroadcastMessage(tpl.msg);
    setSoundType(tpl.sound);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-purple-500/60 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Megaphone className="w-5 h-5 text-purple-400 animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <span>Admin Instant Push Broadcast</span>
                <span className="text-[10px] bg-red-500/20 border border-red-500/40 text-red-300 font-mono px-1.5 py-0.5 rounded animate-pulse">
                  LIVE PUSH
                </span>
              </h3>
              <p className="text-xs text-slate-400">Sabhi employees ke phones par loud sound & voice ke sath alert bhejeyin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Templates */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Quick One-Tap Broadcast Templates:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {quickTemplates.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectTemplate(t)}
                className="text-left p-2 rounded-xl bg-slate-950 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 transition group"
              >
                <p className="text-xs font-bold text-white group-hover:text-purple-300 truncate">{t.title}</p>
                <p className="text-[10px] text-slate-400 line-clamp-1">{t.msg}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-3">
          
          {/* Target Staff Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              Target Audience:
            </label>
            <select
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">📢 All Employees (Entire Team Broadcast)</option>
              <option value="usr_priya_telecaller">👩 Priya Singh (Telecaller & Support)</option>
              <option value="usr_rahul_telecaller">👨 Rahul Sharma (Calling Agent)</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Broadcast Title:
            </label>
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-purple-500"
              placeholder="e.g. 🚨 Urgent NDR Focus"
              required
            />
          </div>

          {/* Message Text */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>Message (Voice me announce hoga):</span>
              <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Hindi TTS Voice
              </span>
            </label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
              placeholder="Apna instruction type karein jo sabhi employees ke mobile par alert sound ke sath pop-up hoga..."
              required
            />
          </div>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold text-center animate-scale-up">
              {successMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !broadcastMessage.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSending ? 'Transmitting Push...' : 'Transmitting Push Alert'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
