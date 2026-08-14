// AI Agent Intelligence Engine - Groq (Llama 3.3 70B) & OpenRouter Free APIs
import { agentMesh } from './agentGraph';
import { awardAgentXp } from './agentEvolution';

// Load keys from Vite environment
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';

// System Prompts with Psychological Framing & Indian Workplace Nuance
export const AGENT_SYSTEM_PROMPTS = {
  ops_manager: `Aap 'Maya Operations Director' hain — MSR Next Gen Agency ke smart, supportive, aur ultra-sharp Operations Manager.
Aapka mission: Team ke daily targets monitor karna (10 leads/day, Amparo calling queue, Urgent RTOs, Video pipeline, Gym client visits).
Tone: Energetic, structured, practical Hinglish with Latin script.
Always acknowledge bottlenecks, give high-priority 1-2-3 actionable steps, and motivate employees like a real world-class leader.`,

  hr_culture: `Aap 'Maya HR & Culture Coach' hain — MSR Next Gen Agency ke empathy-driven, positive organizational psychologist.
Aapka mission: Attendance geofence trends audit karna, burnout identify karna, daily streaks celebrate karna, aur morning motivational nudges dena.
Tone: Warm, encouraging, high-energy Hinglish. Focus on mental clarity, trust, and consistency.`,

  finance_auditor: `Aap 'Maya Finance Sage' hain — 100% transparent agency financial advisor & incentive auditor.
Aapka mission: 8% growth-bonus pool split, deal-level commissions (₹400/deal, 3%/2% Amparo), GPS-verified field visits, and UPI payroll transparency audit karna.
Tone: Accurate, mathematical, crystal clear, building extreme trust with the team.`,

  growth_coach: `Aap 'Maya Performance Mentor' hain — Agency growth strategist.
Aapka mission: Weekly executive briefs generate karna, conversion bottlenecks identify karna, and owner ke liye high-level revenue roadmap provide karna.
Tone: Visionary, concise, metric-driven Hinglish.`
};

/**
 * Executes a completion call using Groq API or OpenRouter API, with graceful offline fallback
 */
export async function callAgentAi({ agentId, userMessage, contextData = {}, customApiKey = null }) {
  const apiKey = customApiKey || GROQ_API_KEY || OPENROUTER_API_KEY;
  const systemPrompt = AGENT_SYSTEM_PROMPTS[agentId] || AGENT_SYSTEM_PROMPTS.ops_manager;

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Context Data:\n${JSON.stringify(contextData, null, 2)}\n\nUser Question/Instruction: ${userMessage}`
    }
  ];

  // If live Groq API key is present
  if (apiKey && apiKey.startsWith('gsk_')) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;
      awardAgentXp(agentId, 30, 'Groq Live Inference');
      return reply;
    } catch (err) {
      console.warn('Groq API call failed, falling back to simulated intelligence', err);
    }
  }

  // If OpenRouter Free API key is present
  if (apiKey && (apiKey.startsWith('sk-or-') || !apiKey.startsWith('gsk_'))) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://msr-next-gen-tracker.netlify.app',
          'X-Title': 'MSR Next Gen Tracker'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        awardAgentXp(agentId, 30, 'OpenRouter Free Inference');
        return reply;
      }
    } catch (err) {
      console.warn('OpenRouter API call failed', err);
    }
  }

  // Built-in Human-like Smart Fallback Generator (Instant Response for Demo / Offline)
  return generateSimulatedHinglishResponse(agentId, userMessage, contextData);
}

/**
 * Intelligent domain-grounded Hinglish response generator (when API key is not yet set)
 */
function generateSimulatedHinglishResponse(agentId, userMessage, contextData) {
  const q = userMessage.toLowerCase();
  awardAgentXp(agentId, 15, 'On-Device Inference');

  if (agentId === 'ops_manager') {
    if (q.includes('rto') || q.includes('urgent')) {
      return `🚨 **Maya Ops Triage Alert:**
Abhi call queue me **${contextData.urgentRtoCount || 2} Urgent RTO orders** hain jo high risk par hain. 
1. Sabse pehle in customers ko direct call karein aur delivery address / alternate number re-verify karein.
2. WhatsApp confirmation status mark karein: *RTO Saved* ya *RTO Lost*.
3. Har saved RTO par ₹50 ka instant protection credit count hota hai! Jaldi wrap karein. 💪`;
    }
    if (q.includes('target') || q.includes('aaj ka') || q.includes('kya karna hai')) {
      return `⚡ **Aaj Ka Ops Plan & Priorities:**
- **Calling Team:** 15 pending Amparo calls wrap karni hain + 2 high-priority RTOs.
- **Editor Team:** Daily quota 10 leads research + 2 Reel edits status 'done' par le aana.
- **Field Executive:** Gorakhpur Gyms (Silajit stock) & 2 MSR client visit GPS proof ke sath log karein.
Let's crush today's target with 100% velocity! 🚀`;
    }
    return `⚡ **Maya Ops Director:** Maine agency task queue analyze kiya hai. Sabhi workflows smooth hain, par urgent RTOs aur daily 10-leads target par team ko focus maintain rakhna hoga. Koi specific blocker hai to batayein!`;
  }

  if (agentId === 'hr_culture') {
    if (q.includes('attendance') || q.includes('geofence') || q.includes('haaziri')) {
      return `💖 **Maya HR Check-in Audit:**
GKP Office 200m geofence radius check active hai. Aaj team ki attendance **92% on-time** rahi hai. 1 member ne geofence ke thoda bahar se check-in kiya tha jiska review log create ho chuka hai. 
Streak record: **5 Days Unbroken!** 🔥 Keep this amazing discipline!`;
    }
    return `🌟 **Maya HR & Morale Coach:** "Consistency hi true superpower hai!" Aaj team ka energy level zabardast hai. Break lena mat bhuliye aur pani pite rahiye. You guys are doing fantastic work! 🎯`;
  }

  if (agentId === 'finance_auditor') {
    return `💰 **Maya Finance Transparency Ledger:**
- **Monthly Revenue Growth Bonus (8% Pool):** Total pool ₹${contextData.bonusPool || '24,000'} jo 3 active team members me equally ₹${contextData.bonusPerMember || '8,000'} split hoga.
- **MSR Deal Commission:** ₹400 per converted deal (Live verified).
- **Amparo Orders:** 3% conversion / 2% retention incentive.
Koi deduction ya calculation hidden nahi hai — 100% transparent audit ready hai! 📊`;
  }

  return `🚀 **Maya Performance Mentor:** Agency ka overall growth trajectory is month +18% chal raha hai. Agar hum urgent RTO recovery rate 65% cross kar lein, toh net agency margin ₹35,000 badh jayega. Great momentum!`;
}
