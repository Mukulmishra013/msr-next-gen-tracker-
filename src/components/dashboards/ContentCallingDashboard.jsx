// Modern Telecaller Workspace & SOP Command Center (Kya Kaise Karna Hai, 1-Tap Calling & WhatsApp)
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
  PackageCheck,
  BookOpen,
  Send,
  Clock,
  MapPin,
  Calendar
} from 'lucide-react';

export function ContentCallingDashboard({ onOpenChat }) {
  const { currentUser } = useAuth();
  const { amparoCalls, incentives, updateCallStatus } = useAppData();
  const [activeCallTab, setActiveCallTab] = useState('all');
  const [showSopModal, setShowSopModal] = useState(false);
  const [callerNotes, setCallerNotes] = useState({});
  const [selectedScript, setSelectedScript] = useState('order_confirm'); // 'order_confirm' | 'rto_rescue' | 'delivery_feedback'

  // Telecaller Performance Metrics
  const userIncentives = incentives.filter((i) => i.user_id === currentUser.id);
  const totalIncentive = userIncentives.reduce((sum, item) => sum + item.amount, 0);

  const confirmedCalls = amparoCalls.filter((c) => c.status === 'confirmed').length;
  const rtoSavedCalls = amparoCalls.filter((c) => c.status === 'rto_saved').length;
  const urgentCount = amparoCalls.filter((c) => c.urgent_rto).length;
  const pendingCount = amparoCalls.filter((c) => c.status === 'pending_confirmation').length;

  const sortedCalls = [...amparoCalls].sort((a, b) => (b.urgent_rto ? 1 : 0) - (a.urgent_rto ? 1 : 0));
  const filteredCalls = sortedCalls.filter((c) => {
    if (activeCallTab === 'urgent_rto') return c.urgent_rto;
    if (activeCallTab === 'pending') return c.status === 'pending_confirmation';
    if (activeCallTab === 'saved') return c.status === 'rto_saved' || c.status === 'confirmed';
    return true;
  });

  // Calling Scripts & SOP
  const SCRIPTS = {
    order_confirm: {
      title: '📞 Naye Order Confirmation Ka Script',
      text: `Namaste [Customer Name] ji! Mai Amparo Ayurveda Customer Care se [Caller Name] bol raha/rahi hoon.\n\nAapka Amparo Pure Himalayan Shilajit (30g) ka order confirm karne ke liye call kiya hai. \n\nKya aapka delivery address: [Address/City] sahi hai? \n\nPayment Mode Cash on Delivery (COD) ₹[Amount] hai. Order 3-4 dino me courier partner deliver kar dega. Kripya apna phone active rakhein! Dhanyawad!`
    },
    rto_rescue: {
      title: '🚨 Urgent RTO / Parcel Delivery Rescue Script',
      text: `Namaste [Customer Name] ji! Mai Amparo Ayurveda se senior support manager bol raha hoon.\n\nAapka Shilajit parcel courier boy deliver karne aaya tha lekin delivery attempt fail hua hai.\n\nKya courier boy ne aapko call kiya tha? Agar aap abhi available hain toh mai courier delivery manager ko bolkar aaj hi dobara delivery re-attempt karwa deta hoon. Kya aaj shaam delivery receive kar payenge?`
    },
    delivery_feedback: {
      title: '🌿 Delivery Ke Baad Usage & Guidance Script',
      text: `Namaste [Customer Name] ji! Amparo Shilajit parcel receive karne ke liye dhanyawad.\n\nShilajit ko subah gungune doodh ya paani ke sath pea-size (chane ke daane barabar) lena hai. Agar koi bhi sawal ho toh is number par WhatsApp karein.`
    }
  };

  const handleSendWhatsApp = (call) => {
    const cleanPhone = String(call.phone).replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const text = encodeURIComponent(
      `Namaste ${call.customer_name} ji! Amparo Ayurveda se aapka order #${call.shopify_order_id} dispatch ho gaya hai. Total COD amount ₹${call.amount} hai. Delivery coordinate karne ke liye hume is number par reply karein.`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Top Telecaller Header & SOP Guide Button */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">📞</span>
            <h2 className="text-base sm:text-lg font-black text-white">Telecaller Operations & Calling Queue</h2>
          </div>
          <p className="text-xs text-slate-300">
            Assigned Caller: <strong className="text-emerald-400">{currentUser.name}</strong> — Order Confirmation, Address Verification & RTO Rescue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSopModal(true)}
            className="tap-target px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 Kya Kaise Bolna Hai (Calling Script)</span>
          </button>
        </div>
      </div>

      {/* Live Caller KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Live Incentive</span>
            <Flame className="w-4 h-4 text-emerald-400 animate-bounce-subtle" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{totalIncentive.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">+₹50 per RTO saved</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider">Urgent RTOs</span>
            <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{urgentCount}</p>
          <p className="text-[10px] text-red-300 font-semibold mt-0.5">Top priority calls</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Pending Calls</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">Orders to verify</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{confirmedCalls + rtoSavedCalls}</p>
          <p className="text-[10px] text-blue-300 font-semibold mt-0.5">{rtoSavedCalls} RTOs Rescued</p>
        </div>
      </div>

      {/* Amparo Calling Queue */}
      <div className="glass-card rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
        
        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Customer Calling Queue</span>
            </h3>
            <p className="text-xs text-slate-400">1-Tap Direct Call, WhatsApp & Order Status Update</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `All (${amparoCalls.length})` },
              { id: 'urgent_rto', label: `🚨 Urgent RTO (${urgentCount})` },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'saved', label: `Saved / Done (${confirmedCalls + rtoSavedCalls})` }
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
              Admin panel me jakar Shiprocket Orders sync karein ya naye orders aane par yahan auto-populate honge!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCalls.map((call) => (
              <div
                key={call.id || call.shopify_order_id}
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
                      <span className="text-[10px] text-slate-400 font-mono">({call.shopify_order_id})</span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{call.product}</p>
                    <p className="text-[11px] text-slate-400">{call.notes}</p>
                  </div>

                  {/* Actions (Call, WhatsApp, Confirm, RTO Saved) */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`tel:${call.phone}`}
                      className="tap-target px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>

                    <button
                      onClick={() => handleSendWhatsApp(call)}
                      className="tap-target px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1 transition active:scale-95"
                      title="Send WhatsApp Order Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>

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
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* SOP & Calling Script Modal */}
      {showSopModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">Telecaller SOP & Calling Script</h3>
              </div>
              <button
                onClick={() => setShowSopModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Script Type Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'order_confirm', label: '1. Order Confirm' },
                { id: 'rto_rescue', label: '2. 🚨 RTO Rescue' },
                { id: 'delivery_feedback', label: '3. Usage & Dose' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScript(s.id)}
                  className={`p-2 rounded-xl text-xs font-bold transition ${
                    selectedScript === s.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Script Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-emerald-400">
                {SCRIPTS[selectedScript].title}
              </h4>
              <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {SCRIPTS[selectedScript].text}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>💡 <strong>Pro-Tip:</strong> Pehle 5 seconds me customer ko unka product name (Amparo Shilajit) yaad dilayein — cancellation rate 40% ghat jata hai!</p>
            </div>

            <button
              onClick={() => setShowSopModal(false)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Guide & Start Calling ➔
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
