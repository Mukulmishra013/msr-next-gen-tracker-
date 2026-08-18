// Full-Screen Emergency Incoming Admin Broadcast Popup with Audio Wave & Voice Replay
import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { 
  Megaphone, 
  Volume2, 
  X, 
  CheckCircle2, 
  Radio, 
  Sparkles, 
  ShieldAlert,
  Clock,
  Play
} from 'lucide-react';

export function IncomingBroadcastAlertModal() {
  const [activeBroadcast, setActiveBroadcast] = useState(null);

  useEffect(() => {
    const unsub = notificationService.subscribe((event) => {
      if (event && event.type === 'INCOMING_BROADCAST' && event.payload) {
        setActiveBroadcast(event.payload);
      }
    });
    return unsub;
  }, []);

  if (!activeBroadcast) return null;

  const handleReplayVoice = () => {
    notificationService.playBroadcastChime();
    setTimeout(() => {
      notificationService.speakHindiVoice(activeBroadcast.voiceText || activeBroadcast.body);
    }, 400);
  };

  const handleAcknowledge = () => {
    setActiveBroadcast(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 border-2 border-red-500 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-red-500/30 space-y-5 animate-scale-up relative overflow-hidden">
        
        {/* Glowing Ambient Light */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

        {/* Top Emergency Ribbon */}
        <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 animate-bounce">
              <Megaphone className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  URGENT BROADCAST
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(activeBroadcast.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                {activeBroadcast.title || '👑 Admin Directive (Mukul Mishra)'}
              </h3>
            </div>
          </div>

          <button
            onClick={handleAcknowledge}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sender Profile */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-600 flex items-center justify-center font-bold text-white shadow-md">
            👑
          </div>
          <div>
            <p className="text-xs font-black text-white">Mukul Mishra (Director & Super Admin)</p>
            <p className="text-[10px] text-purple-300">Live Audio & Push Broadcast</p>
          </div>
        </div>

        {/* Message Content Box */}
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/50 space-y-2">
          <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
            "{activeBroadcast.body}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <button
            onClick={handleReplayVoice}
            className="tap-target w-full sm:flex-1 py-3 rounded-2xl bg-purple-950 hover:bg-purple-900 border border-purple-500/60 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
          >
            <Volume2 className="w-4 h-4 text-purple-300 animate-pulse" />
            <span>🔊 Replay Voice Message</span>
          </button>

          <button
            onClick={handleAcknowledge}
            className="tap-target w-full sm:flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>✅ Samjh Gayi / Acknowledge</span>
          </button>
        </div>

      </div>
    </div>
  );
}
