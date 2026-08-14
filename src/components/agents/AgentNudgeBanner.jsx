// Dynamic Psychological Behavioral Nudge Banner
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Flame, Trophy, X, ArrowRight, Heart } from 'lucide-react';

const PSYCHOLOGY_NUDGES = {
  content_calling: [
    {
      title: '🎯 Tone & Confidence Tip',
      text: 'Pehle 5 seconds me customer ko unka order product name yaad dilayein — confirmation rate 35% badh jata hai!',
      author: 'Maya Ops Director'
    },
    {
      title: '💰 RTO Protection Bonus',
      text: 'Har bacha hua RTO ₹50 direct protection credit deta hai. Aaj 3 RTOs save karne ka target rakhein!',
      author: 'Maya Finance Sage'
    }
  ],
  editor_leads: [
    {
      title: '⚡ Editing Momentum',
      text: 'Top 3-second hook se retention 2x ho jata hai. Aaj ke 2 reels me curiosity hook use karein!',
      author: 'Maya Creative Coach'
    },
    {
      title: '🚀 Lead Scouting Quota',
      text: '10 quality local Gorakhpur leads research complete karne par daily milestone badge unlock hoga!',
      author: 'Maya Ops Director'
    }
  ],
  field_executive: [
    {
      title: '🛵 GPS Verification Badge',
      text: 'Har Gym aur client visit par 1-tap GPS verify karein. Instant incentive payout me 0 delay hoga!',
      author: 'Maya HR & Morale'
    },
    {
      title: '💪 Gym Shilajit Batch Sale',
      text: 'Gym owners ko direct sample test karwayein — bulk 12-bottle order close karne ka 80% chance rehta hai.',
      author: 'Maya Performance Mentor'
    }
  ],
  owner: [
    {
      title: '👑 Agency Revenue Velocity',
      text: 'August month ka growth rate +18% hai. 8% bonus pool ₹6,400 team me high motivation maintain kar raha hai!',
      author: 'Maya Finance Sage'
    }
  ]
};

export function AgentNudgeBanner({ onOpenChat }) {
  const { currentUser } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [nudgeIndex, setNudgeIndex] = useState(0);

  const nudges = PSYCHOLOGY_NUDGES[currentUser.role] || PSYCHOLOGY_NUDGES.content_calling;
  const activeNudge = nudges[nudgeIndex % nudges.length];

  if (dismissed || !activeNudge) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-purple-950/60 border border-emerald-500/30 p-3.5 sm:p-4 text-xs shadow-lg">
      <div className="flex items-start justify-between gap-3">
        
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-xs">{activeNudge.title}</span>
              <span className="text-[10px] text-purple-300 font-semibold">• {activeNudge.author}</span>
            </div>
            <p className="text-slate-300 mt-1 leading-relaxed">{activeNudge.text}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onOpenChat}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
          >
            <span>Ask Maya</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-500 hover:text-slate-300 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
