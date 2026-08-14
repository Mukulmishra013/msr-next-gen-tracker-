// Telecaller Dashboard with AI Sales Expert WhatsApp Dispatcher & Direct Web/Mobile Integration
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
  BookOpen, 
  Send, 
  Clock, 
  PackageCheck,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';

export function ContentCallingDashboard({ onOpenChat }) {
  const { currentUser } = useAuth();
  const { amparoCalls, incentives, updateCallStatus } = useAppData();
  const [activeCallTab, setActiveCallTab] = useState('all');
  const [showSopModal, setShowSopModal] = useState(false);
  const [activeWhatsappOrder, setActiveWhatsappOrder] = useState(null);
  const [customWaMessage, setCustomWaMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedScript, setSelectedScript] = useState('order_confirm');

  // Stats & Performance
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

  // Generate Professional Sales Expert AI WhatsApp Message
  const generateAiWhatsappText = (order) => {
    const custName = order.customer_name && order.customer_name !== 'Verified Buyer' ? order.customer_name : 'Valued Customer';
    const orderId = order.shopify_order_id ? `#${order.shopify_order_id.replace('#', '')}` : '#AmparoOrder';
    const amount = order.amount || 588;
    const product = order.product || 'Amparo Pure Shilajit (30g)';

    if (order.urgent_rto) {
      return `🙏 Namaste ${custName} Ji!

Mai *Amparo Ayurveda* (Official Logistics Support) se baat kar raha hoon.

📦 Aapka *${product}* (Order ${orderId}) courier delivery attempt me unreached/pending ho gaya hai.

Hum aapka parcel cancel nahi hone dena chahte kyunki aapka fresh laboratory-tested batch reserved hai!

💵 *COD Amount on Delivery:* ₹${amount} (Free Shipping + 100% Herbal Quality Guarantee)
🚚 *Status:* Delivery Re-attempt Ready

👉 *Kripya "CONFIRM" reply karein* taaki hum delivery boy ko bolkar aaj hi aapke address par priority deliver karwa dein.

Dhanyawad!
*Team Amparo Ayurveda* 🌿`;
    }

    return `🙏 Namaste ${custName} Ji!

*Amparo Ayurveda* me aapka order successfully confirm ho gaya hai!

📦 *Product:* ${product}
🆔 *Order ID:* ${orderId}
💵 *Total COD Amount:* ₹${amount}

Aapka parcel safe & sealed packaging ke sath 24 hours ke andar dispatch ho raha hai.

👉 Kripya delivery ke liye apna phone active rakhein. Kisi bhi sahayata ke liye is number par message karein.

Dhanyawad!
*Team Amparo Ayurveda* 🌿`;
  };

  const handleOpenWhatsappModal = (call) => {
    const msg = generateAiWhatsappText(call);
    setActiveWhatsappOrder(call);
    setCustomWaMessage(msg);
    setCopySuccess(false);
  };

  const handleSendWhatsappDirect = () => {
    if (!activeWhatsappOrder) return;
    const cleanPhone = String(activeWhatsappOrder.phone).replace(/\D/g, '');
    const phone10 = cleanPhone.slice(-10);
    const fullPhone = `91${phone10}`;
    const encoded = encodeURIComponent(customWaMessage);

    // Cross-platform WhatsApp Link (Works on both Web & Mobile app)
    const url = `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customWaMessage);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
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
            Assigned: <strong className="text-emerald-400">{currentUser.name}</strong> — AI Sales WhatsApp, Address Verification & RTO Rescue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSopModal(true)}
            className="tap-target px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>📖 Calling SOP & Scripts</span>
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
          <p className="text-[10px] text-red-300 font-semibold mt-0.5">Shiprocket RTO alerts</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Pending Calls</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">Verification required</p>
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

      {/* Customer Calling Queue */}
      <div className="glass-card rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
        
        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Customer Calling Queue ({amparoCalls.length} Real Orders)</span>
            </h3>
            <p className="text-xs text-slate-400">1-Tap Direct Call, AI Sales WhatsApp & Live Status Update</p>
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

        {/* Calls List */}
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

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`tel:${call.phone}`}
                    className="tap-target px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  {/* High Converting WhatsApp Trigger */}
                  <button
                    onClick={() => handleOpenWhatsappModal(call)}
                    className="tap-target px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-yellow-300" />
                    <span>AI WhatsApp ➔</span>
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

      </div>

      {/* AI WhatsApp Message Sender Modal */}
      {activeWhatsappOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Sales Expert AI WhatsApp Message</h3>
                  <p className="text-[10px] text-slate-400">Sending to: {activeWhatsappOrder.customer_name} ({activeWhatsappOrder.phone})</p>
                </div>
              </div>

              <button
                onClick={() => setActiveWhatsappOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Customizable AI Sales Message (Hindi/Hinglish):</span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copySuccess ? 'Copied! ✅' : 'Copy Text'}</span>
                </button>
              </label>

              <textarea
                rows={9}
                value={customWaMessage}
                onChange={(e) => setCustomWaMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="tap-target py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copySuccess ? 'Copied! ✅' : 'Copy Message'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsappDirect}
                className="tap-target py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Open in WhatsApp Web / App ➔</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SOP Guide Modal */}
      {showSopModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-base text-white">Telecaller SOP & Calling Scripts</h3>
              </div>
              <button
                onClick={() => setShowSopModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {`📞 **Amparo Shilajit Calling SOP (Best Practices):**
1. **Urgent RTO Rescue:** Customer ko bataiye ki unka Shilajit batch reserved hai aur aaj delivery attempt karwaya ja sakta hai.
2. **Confidence Tone:** Customer se hamesha respectful & clear Hindi/Hinglish me baat karein.
3. **WhatsApp Followup:** Call ke baad turant "AI WhatsApp ➔" button dabakar confirmation template bhejein.`}
            </div>

            <button
              onClick={() => setShowSopModal(false)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Guide ➔
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
