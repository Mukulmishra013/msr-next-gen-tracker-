// Telecaller Dashboard with Clear Phone Numbers, Dedicated WhatsApp Web & Mobile Links, and Zero Freeze
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
  X,
  Phone,
  Monitor,
  Smartphone
} from 'lucide-react';

export function ContentCallingDashboard({ onOpenChat }) {
  const { currentUser } = useAuth();
  const { amparoCalls, incentives, updateCallStatus } = useAppData();
  const [activeCallTab, setActiveCallTab] = useState('all');
  const [showSopModal, setShowSopModal] = useState(false);
  const [activeWhatsappOrder, setActiveWhatsappOrder] = useState(null);
  const [customWaMessage, setCustomWaMessage] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyPhoneSuccess, setCopyPhoneSuccess] = useState(false);

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
    const custName = order.customer_name && order.customer_name !== 'Verified Buyer' ? order.customer_name : 'Customer';
    const orderId = order.shopify_order_id ? `#${order.shopify_order_id.replace('#', '')}` : '#AmparoOrder';
    const amount = order.amount || 588;
    const product = order.product || 'Amparo Pure Shilajit (30g)';

    if (order.urgent_rto) {
      return `Namaste ${custName} Ji!

Mai *Amparo Ayurveda* Support se baat kar raha hoon.

Aapka parcel *${product}* (${orderId}) courier delivery attempt me pending ho gaya hai.

💵 *COD Amount:* ₹${amount} (Free Shipping)

👉 Kripya *YES* ya *CONFIRM* reply karein taaki hum delivery boy ko bolkar aaj hi aapke address par priority deliver karwa dein.

Dhanyawad!
*Team Amparo Ayurveda* 🌿`;
    }

    return `Namaste ${custName} Ji!

*Amparo Ayurveda* me aapka order receive ho gaya hai!

📦 *Product:* ${product}
🆔 *Order ID:* ${orderId}
💵 *Amount to Pay (COD):* ₹${amount}

Aapka parcel dispatch ho raha hai. Kripya delivery confirm karne ke liye *CONFIRM* reply karein.

Dhanyawad!
*Team Amparo Ayurveda* 🌿`;
  };

  const handleOpenWhatsappModal = (call) => {
    const msg = generateAiWhatsappText(call);
    const cleanNumber = String(call.phone).replace(/\D/g, '').slice(-10);
    setActiveWhatsappOrder(call);
    setTargetPhone(cleanNumber || '8887521156');
    setCustomWaMessage(msg);
    setCopySuccess(false);
    setCopyPhoneSuccess(false);
  };

  // 1. WhatsApp Web Direct (for PC/Laptops - Guaranteed No Freeze)
  const handleOpenWhatsAppWeb = () => {
    const cleanDigits = targetPhone.replace(/\D/g, '').slice(-10);
    const fullPhone = `91${cleanDigits}`;
    const encoded = encodeURIComponent(customWaMessage);
    const url = `https://web.whatsapp.com/send?phone=${fullPhone}&text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 2. WhatsApp Mobile / App Direct (for Phones)
  const handleOpenWhatsAppApp = () => {
    const cleanDigits = targetPhone.replace(/\D/g, '').slice(-10);
    const fullPhone = `91${cleanDigits}`;
    const encoded = encodeURIComponent(customWaMessage);
    const url = `https://wa.me/${fullPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customWaMessage);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(targetPhone);
    setCopyPhoneSuccess(true);
    setTimeout(() => setCopyPhoneSuccess(false), 2500);
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
            Assigned: <strong className="text-emerald-400">{currentUser.name}</strong> — Customer Mobile, AI WhatsApp & RTO Rescue.
          </p>
        </div>

        <button
          onClick={() => setShowSopModal(true)}
          className="tap-target px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition active:scale-95 self-start"
        >
          <BookOpen className="w-4 h-4" />
          <span>📖 Calling SOP & Scripts</span>
        </button>
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
          <p className="text-[10px] text-red-300 font-semibold mt-0.5">Top priority calling</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Pending Calls</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">Verification queue</p>
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
              <span>Customer Calling Queue ({amparoCalls.length} Orders)</span>
            </h3>
            <p className="text-xs text-slate-400">Customer Mobile, Direct Dial & AI WhatsApp Dispatcher</p>
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
                
                {/* Customer Details & Prominent Mobile Number */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {call.urgent_rto && (
                      <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">
                        URGENT RTO
                      </span>
                    )}
                    <span className="font-extrabold text-sm text-white">{call.customer_name}</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">₹{call.amount}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({call.shopify_order_id})</span>
                  </div>

                  {/* Prominent Visible Customer Mobile */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-amber-400" />
                      <span>{call.phone}</span>
                    </span>
                    <p className="text-xs text-slate-300 font-medium truncate max-w-xs">{call.product}</p>
                  </div>

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

                  {/* AI WhatsApp Trigger */}
                  <button
                    onClick={() => handleOpenWhatsappModal(call)}
                    className="tap-target px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-yellow-300" />
                    <span>WhatsApp ➔</span>
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

      {/* WhatsApp Sender Modal (With Customer Number, Web Link & Mobile Link) */}
      {activeWhatsappOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Send WhatsApp to Customer</h3>
                  <p className="text-[10px] text-slate-400">{activeWhatsappOrder.customer_name}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveWhatsappOrder(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Phone Field */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Customer Mobile Number (10 Digits):</span>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copyPhoneSuccess ? 'Number Copied! ✅' : 'Copy Number'}</span>
                </button>
              </label>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                  +91
                </span>
                <input
                  type="tel"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="Enter 10 digit mobile"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Message Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>AI Sales Message (Ready to Send):</span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copySuccess ? 'Text Copied! ✅' : 'Copy Text'}</span>
                </button>
              </label>

              <textarea
                rows={7}
                value={customWaMessage}
                onChange={(e) => setCustomWaMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
              />
            </div>

            {/* Action Buttons (PC WhatsApp Web & Mobile App) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* WhatsApp Web Button for Laptop / PC */}
              <button
                type="button"
                onClick={handleOpenWhatsAppWeb}
                className="tap-target py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition active:scale-95"
              >
                <Monitor className="w-4 h-4" />
                <span>Open in WhatsApp Web (PC) ➔</span>
              </button>

              {/* WhatsApp App Button for Mobile */}
              <button
                type="button"
                onClick={handleOpenWhatsAppApp}
                className="tap-target py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open in WhatsApp App ➔</span>
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
              {`📞 **Amparo Shilajit Calling SOP:**
1. **Urgent RTO Rescue:** Customer ko bataiye ki unka Shilajit batch reserved hai aur aaj priority re-attempt delivery karwaya ja sakta hai.
2. **WhatsApp Followup:** Agar call attend nahi hua ya busy hai, turant "WhatsApp ➔" button dabakar WhatsApp Web se message bhejein.`}
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
