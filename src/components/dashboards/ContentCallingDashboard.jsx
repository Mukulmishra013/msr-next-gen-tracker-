// Telecaller & AI Autonomous Voice Calling Command Center (Maya with Bolna.ai)
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
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
  Smartphone,
  Edit3,
  Save,
  Upload,
  FileSpreadsheet,
  Bot,
  Play,
  Volume2,
  FileText,
  Zap,
  RotateCw,
  Truck,
  Ban
} from 'lucide-react';

export function ContentCallingDashboard({ onOpenChat }) {
  const { currentUser } = useAuth();
  const { 
    amparoCalls, 
    setAmparoCalls, 
    incentives, 
    updateCallStatus, 
    updateCallPhone,
    triggerAiCall,
    triggerBatchAiCalls 
  } = useAppData();

  const [activeCallTab, setActiveCallTab] = useState('all');
  const [showSopModal, setShowSopModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeWhatsappOrder, setActiveWhatsappOrder] = useState(null);
  const [customWaMessage, setCustomWaMessage] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [editingPhoneId, setEditingPhoneId] = useState(null);
  const [editingPhoneVal, setEditingPhoneVal] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyPhoneSuccess, setCopyPhoneSuccess] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  // AI Calling States
  const [callingOrderId, setCallingOrderId] = useState(null);
  const [isBatchCalling, setIsBatchCalling] = useState(false);
  const [selectedAudioCall, setSelectedAudioCall] = useState(null);
  const [selectedTranscriptCall, setSelectedTranscriptCall] = useState(null);
  const [aiCallMessage, setAiCallMessage] = useState('');

  // Stats & Performance
  const userIncentives = incentives.filter((i) => i.user_id === currentUser.id);
  const totalIncentive = userIncentives.reduce((sum, item) => sum + item.amount, 0);

  const confirmedCalls = amparoCalls.filter((c) => c.status === 'confirmed').length;
  const rtoSavedCalls = amparoCalls.filter((c) => c.status === 'rto_saved').length;
  const urgentCount = amparoCalls.filter((c) => c.urgent_rto).length;
  const pendingCount = amparoCalls.filter((c) => c.status === 'pending_confirmation').length;
  const aiCallsCount = amparoCalls.filter((c) => c.call_source === 'ai_agent').length;
  const fakeCancelledCount = amparoCalls.filter((c) => c.status === 'rto_lost' || c.ai_decision === 'fake_order').length;

  const sortedCalls = [...amparoCalls].sort((a, b) => (b.urgent_rto ? 1 : 0) - (a.urgent_rto ? 1 : 0));
  
  const filteredCalls = sortedCalls.filter((c) => {
    if (activeCallTab === 'urgent_rto') return c.urgent_rto;
    if (activeCallTab === 'pending') return c.status === 'pending_confirmation';
    if (activeCallTab === 'ai_confirmed') return c.status === 'confirmed' || c.status === 'rto_saved';
    if (activeCallTab === 'ai_fake_cancelled') return c.status === 'rto_lost' || c.ai_decision === 'fake_order';
    if (activeCallTab === 'saved') return c.status === 'rto_saved' || c.status === 'confirmed';
    return true;
  });

  // 1-Click Single AI Call Trigger
  const handleTriggerSingleAiCall = async (call) => {
    setCallingOrderId(call.id || call.shopify_order_id);
    setAiCallMessage('');
    try {
      const res = await triggerAiCall({
        id: call.id,
        shopify_order_id: call.shopify_order_id,
        phone: call.phone,
        customer_name: call.customer_name,
        product_name: call.product,
        order_amount: call.amount,
        delivery_address: call.notes || 'India',
        delivery_timeline: 'तीन से पाँच दिन',
        combo_product: 'Smilika SPF 50 Sunscreen',
        combo_discount: 'एक सौ रुपये',
        customer_type: call.status === 'confirmed' ? 'OLD_CUSTOMER' : 'NEW_CUSTOMER',
        discount_value: 'पचास रुपये की छूट',
        coupon_code: 'AMPARO50'
      });

      setAiCallMessage(`✅ Maya is calling ${call.customer_name} (${call.phone})...`);
      setTimeout(() => setAiCallMessage(''), 4000);
    } catch (err) {
      alert(`AI Call Error: ${err.message}`);
    } finally {
      setCallingOrderId(null);
    }
  };

  // 1-Click Batch AI Calling for all Pending & Urgent orders
  const handleTriggerBatchAiCalls = async () => {
    const targetQueue = amparoCalls.filter(
      (c) => c.status === 'pending_confirmation' || c.urgent_rto
    );

    if (targetQueue.length === 0) {
      alert('Sabhi orders already confirmed ya processed hain! Calling queue khali hai.');
      return;
    }

    if (!window.confirm(`Kya aap ${targetQueue.length} pending orders par Maya AI se Auto-Calling start karna chahte hain?`)) {
      return;
    }

    setIsBatchCalling(true);
    try {
      const res = await triggerBatchAiCalls(targetQueue);
      alert(`⚡ SUCCESS: ${res.total_triggered || targetQueue.length} Calls Maya AI ne start kar di hain! Live results update hote rahenge.`);
    } catch (err) {
      alert(`Batch Calling Error: ${err.message}`);
    } finally {
      setIsBatchCalling(false);
    }
  };

  // Generate Professional Sales Expert AI WhatsApp Message
  const generateAiWhatsappText = (order) => {
    const custName = order.customer_name && order.customer_name !== 'Verified Buyer' ? order.customer_name : 'Customer';
    const orderId = order.shopify_order_id ? `#${order.shopify_order_id.replace('#', '')}` : '#AmparoOrder';
    const amount = order.amount || 449;
    const product = order.product || 'Amparo Pure Shilajit Gummies';

    if (order.urgent_rto) {
      return `Namaste ${custName} Ji!

Mai *Amparo Store* Support se baat kar raha hoon.

Aapka parcel *${product}* (${orderId}) courier delivery attempt me pending ho gaya hai.

💵 *COD Amount:* ₹${amount} (Free Shipping)

👉 Kripya *YES* ya *CONFIRM* reply karein taaki hum delivery boy ko bolkar aaj hi aapke address par priority deliver karwa dein.

Dhanyawad!
*Team Amparo Store* 🌿`;
    }

    return `Namaste ${custName} Ji!

*Amparo Store* me aapka order receive ho gaya hai!

📦 *Product:* ${product}
🆔 *Order ID:* ${orderId}
💵 *Amount to Pay (COD):* ₹${amount}

Aapka parcel dispatch ho raha hai. Kripya delivery confirm karne ke liye *CONFIRM* reply karein.

Dhanyawad!
*Team Amparo Store* 🌿`;
  };

  const handleOpenWhatsappModal = (call) => {
    const msg = generateAiWhatsappText(call);
    const cleanDigits = String(call.phone || '').replace(/\D/g, '');
    const valid10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '';

    setActiveWhatsappOrder(call);
    setTargetPhone(valid10);
    setCustomWaMessage(msg);
    setCopySuccess(false);
    setCopyPhoneSuccess(false);
  };

  const handleSavePhoneInline = async (callId) => {
    const cleanDigits = editingPhoneVal.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length === 10) {
      await updateCallPhone(callId, cleanDigits);
    }
    setEditingPhoneId(null);
  };

  // WhatsApp Web Direct (PC/Laptop)
  const handleOpenWhatsAppWeb = async () => {
    const cleanDigits = targetPhone.replace(/\D/g, '').slice(-10);
    if (!cleanDigits || cleanDigits.length < 10) {
      alert('Kripya 10-digit customer mobile number enter karein!');
      return;
    }
    
    if (activeWhatsappOrder && cleanDigits.length === 10) {
      await updateCallPhone(activeWhatsappOrder.id, cleanDigits);
    }

    const fullPhone = `91${cleanDigits}`;
    const encoded = encodeURIComponent(customWaMessage);
    const url = `https://web.whatsapp.com/send?phone=${fullPhone}&text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // WhatsApp Mobile App
  const handleOpenWhatsAppApp = async () => {
    const cleanDigits = targetPhone.replace(/\D/g, '').slice(-10);
    if (!cleanDigits || cleanDigits.length < 10) {
      alert('Kripya 10-digit customer mobile number enter karein!');
      return;
    }

    if (activeWhatsappOrder && cleanDigits.length === 10) {
      await updateCallPhone(activeWhatsappOrder.id, cleanDigits);
    }

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

  // Handle CSV file upload with real phone numbers
  const handleCsvFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvLoading(true);
    setImportStatus('CSV read ho rahi hai...');

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) throw new Error('CSV file me orders nahi hain.');

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const parsedOrders = [];

      for (let i = 1; i < lines.length; i++) {
        const rawCols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (rawCols.length < 2) continue;
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = (rawCols[idx] || '').trim().replace(/^["']|["']$/g, '');
        });
        parsedOrders.push(row);
      }

      setImportStatus(`${parsedOrders.length} orders match ho rahe hain...`);

      const res = await fetch('/api/shiprocket-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvOrders: parsedOrders })
      });

      const data = await res.json();
      if (data.success && data.orders) {
        setAmparoCalls(data.orders);
        setImportStatus(`✅ SUCCESS! ${data.orders.length} Real Orders aur Unmasked Mobile Numbers load ho gaye!`);
        setTimeout(() => {
          setShowImportModal(false);
          setImportStatus('');
        }, 1500);
      } else {
        throw new Error(data.message || 'Import error.');
      }
    } catch (err) {
      setImportStatus(`❌ Error: ${err.message}`);
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      
      {/* Top Telecaller & AI Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h2 className="text-base sm:text-lg font-black text-white">Maya AI Voice Calling & Telecaller Center</h2>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Bolna.ai Live
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Assigned: <strong className="text-emerald-400">{currentUser.name}</strong> — Auto-COD Confirmation, RTO Prevention & Recordings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* ⚡ Batch Auto-Dialer Button */}
          <button
            onClick={handleTriggerBatchAiCalls}
            disabled={isBatchCalling}
            className={`tap-target px-4 py-2 rounded-xl text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition active:scale-95 ${
              isBatchCalling
                ? 'bg-amber-600 cursor-wait'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 shadow-purple-600/30'
            }`}
          >
            <Zap className={`w-4 h-4 text-yellow-300 ${isBatchCalling ? 'animate-spin' : 'animate-bounce-subtle'}`} />
            <span>{isBatchCalling ? 'Auto-Calling in Progress...' : `⚡ Auto-Dial All Pending (${pendingCount})`}</span>
          </button>

          {/* 1-Click Import CSV Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="tap-target px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>📁 Import CSV</span>
          </button>

          <button
            onClick={() => setShowSopModal(true)}
            className="tap-target px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>📖 SOP Scripts</span>
          </button>
        </div>
      </div>

      {/* Floating Status Notification */}
      {aiCallMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-xs font-bold text-emerald-200 flex items-center gap-2 shadow-lg animate-fade-in">
          <Bot className="w-4 h-4 text-emerald-400 animate-bounce-subtle" />
          <span>{aiCallMessage}</span>
        </div>
      )}

      {/* Live Caller & AI KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-3.5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Live Incentive</span>
            <Flame className="w-3.5 h-3.5 text-emerald-400 animate-bounce-subtle" />
          </div>
          <p className="text-xl font-black text-white mt-1">₹{totalIncentive.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">+₹50 per RTO saved</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">🤖 AI Calls</span>
            <Bot className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{aiCallsCount}</p>
          <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Maya autonomous calls</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Urgent RTOs</span>
            <AlertCircle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          </div>
          <p className="text-xl font-black text-white mt-1">{urgentCount}</p>
          <p className="text-[10px] text-red-300 font-semibold mt-0.5">High risk orders</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Pending Calls</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">Ready to auto-dial</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/50 to-slate-900 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{confirmedCalls + rtoSavedCalls}</p>
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
              <span>Live Order & Calling Feed ({amparoCalls.length})</span>
            </h3>
            <p className="text-xs text-slate-400">1-Click Maya AI Calling, Recording Player & Shopify Sync</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `All (${amparoCalls.length})` },
              { id: 'urgent_rto', label: `🚨 Urgent RTO (${urgentCount})` },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'ai_confirmed', label: `🟢 Confirmed (${confirmedCalls + rtoSavedCalls})` },
              { id: 'ai_fake_cancelled', label: `🔴 Cancelled (${fakeCancelledCount})` }
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
          {filteredCalls.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
              <PackageCheck className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">Is filter me koi orders nahi hain.</p>
            </div>
          ) : (
            filteredCalls.map((call) => {
              const isMasked = !call.phone || call.phone.includes('xxxx') || call.phone === '+91' || call.phone === '91';
              const displayPhone = isMasked ? 'Enter Mobile' : call.phone;
              const isCallingThis = callingOrderId === (call.id || call.shopify_order_id);

              return (
                <div
                  key={call.id || call.shopify_order_id}
                  className={`p-4 rounded-2xl border transition ${
                    call.status === 'calling_in_progress'
                      ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/30'
                      : call.urgent_rto
                      ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/30'
                      : call.status === 'confirmed' || call.status === 'rto_saved'
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : call.status === 'rto_lost' || call.ai_decision === 'fake_order'
                      ? 'bg-red-950/20 border-red-900/60 opacity-80'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Customer Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Badges */}
                        {call.status === 'calling_in_progress' && (
                          <span className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            MAYA AI CALLING...
                          </span>
                        )}
                        {call.urgent_rto && (
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">
                            URGENT RTO
                          </span>
                        )}
                        {(call.status === 'confirmed' || call.status === 'rto_saved') && (
                          <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            CONFIRMED (SHIP)
                          </span>
                        )}
                        {(call.status === 'rto_lost' || call.ai_decision === 'fake_order') && (
                          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            CANCEL (DO NOT SHIP)
                          </span>
                        )}

                        <span className="font-extrabold text-sm text-white">{call.customer_name}</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">₹{call.amount}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({call.shopify_order_id})</span>

                        {call.call_source === 'ai_agent' && (
                          <span className="bg-purple-900/60 text-purple-300 border border-purple-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            🤖 AI Verified
                          </span>
                        )}
                      </div>

                      {/* Phone & Product */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {editingPhoneId === call.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="tel"
                              autoFocus
                              value={editingPhoneVal}
                              onChange={(e) => setEditingPhoneVal(e.target.value)}
                              placeholder="Enter 10-digit number"
                              className="bg-slate-900 border border-emerald-500 rounded-lg px-2 py-0.5 text-xs font-mono text-emerald-300 w-36 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSavePhoneInline(call.id)}
                              className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                              title="Save Number"
                            >
                              <Save className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingPhoneId(call.id);
                              setEditingPhoneVal(isMasked ? '' : String(call.phone).replace(/\D/g, '').slice(-10));
                            }}
                            className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 transition ${
                              isMasked
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50 hover:bg-amber-900'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                            }`}
                            title="Click to Edit / Save Number"
                          >
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>{displayPhone}</span>
                            <Edit3 className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                          </button>
                        )}

                        <p className="text-xs text-slate-300 font-medium truncate max-w-xs">{call.product}</p>
                      </div>

                      {/* Notes & Transcript snippet */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                        <span>{call.notes}</span>
                        {call.call_duration_seconds > 0 && (
                          <span className="text-emerald-400 font-mono">⏱️ {call.call_duration_seconds}s call</span>
                        )}
                        {call.cancellation_reason && (
                          <span className="text-red-400 font-semibold">⚠️ Reason: {call.cancellation_reason}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons Matrix */}
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {/* 🤖 Trigger Maya AI Call Button */}
                      <button
                        onClick={() => handleTriggerSingleAiCall(call)}
                        disabled={isCallingThis || isMasked}
                        className={`tap-target px-3.5 py-2 rounded-xl text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 ${
                          isCallingThis
                            ? 'bg-purple-700 cursor-wait animate-pulse'
                            : isMasked
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                        }`}
                        title={isMasked ? 'Pehle phone number enter karein' : 'Maya AI se direct call lagayein'}
                      >
                        <Bot className={`w-3.5 h-3.5 text-yellow-300 ${isCallingThis ? 'animate-spin' : ''}`} />
                        <span>{isCallingThis ? 'Calling...' : 'Maya AI Call'}</span>
                      </button>

                      {/* 🎧 Listen Audio Recording Button (If Available) */}
                      {call.recording_url && (
                        <button
                          onClick={() => setSelectedAudioCall(call)}
                          className="tap-target px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
                          title="Listen to Call Recording"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Audio</span>
                        </button>
                      )}

                      {/* 📜 Read Transcript Button (If Available) */}
                      {call.transcript && (
                        <button
                          onClick={() => setSelectedTranscriptCall(call)}
                          className="tap-target px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1 transition active:scale-95"
                          title="Read Conversation Transcript"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Transcript</span>
                        </button>
                      )}

                      {/* Direct Manual Phone Call */}
                      <a
                        href={`tel:${call.phone}`}
                        className="tap-target p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center shadow-md shadow-emerald-600/30 transition active:scale-95"
                        title="Manual Call from Phone"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>

                      {/* AI WhatsApp Trigger */}
                      <button
                        onClick={() => handleOpenWhatsappModal(call)}
                        className="tap-target p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs flex items-center shadow-md transition active:scale-95"
                        title="Send WhatsApp Message"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Manual Confirm & Cancel */}
                      <button
                        onClick={() => updateCallStatus(call.id, 'confirmed')}
                        className="tap-target p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition active:scale-95"
                        title="Mark Confirmed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => updateCallStatus(call.id, 'rto_lost')}
                        className="tap-target p-2 rounded-xl bg-slate-800 hover:bg-red-950 text-red-400 border border-slate-700 text-xs font-bold transition active:scale-95"
                        title="Mark Cancelled / Fake"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* 🎧 Audio Recording Modal */}
      {selectedAudioCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-400 animate-bounce-subtle" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Call Recording Player</h3>
                  <p className="text-[10px] text-slate-400">{selectedAudioCall.customer_name} ({selectedAudioCall.phone})</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAudioCall(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
              <div className="space-y-1">
                <span className="text-xs font-mono text-emerald-400 font-bold">Order ID: {selectedAudioCall.shopify_order_id}</span>
                <p className="text-xs text-slate-300">{selectedAudioCall.product}</p>
                {selectedAudioCall.call_duration_seconds > 0 && (
                  <p className="text-[11px] text-slate-400">Duration: {selectedAudioCall.call_duration_seconds} seconds</p>
                )}
              </div>

              {/* Native HTML5 Audio Player */}
              <audio
                controls
                autoPlay
                src={selectedAudioCall.recording_url}
                className="w-full rounded-xl mt-2"
              >
                Your browser does not support audio playback.
              </audio>

              <div className="pt-2 flex justify-center">
                <a
                  href={selectedAudioCall.recording_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Download / Open in New Tab</span>
                </a>
              </div>
            </div>

            <button
              onClick={() => setSelectedAudioCall(null)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Player
            </button>

          </div>
        </div>
      )}

      {/* 📜 Conversation Transcript Modal */}
      {selectedTranscriptCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Maya AI Call Transcript</h3>
                  <p className="text-[10px] text-slate-400">{selectedTranscriptCall.customer_name} ({selectedTranscriptCall.shopify_order_id})</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTranscriptCall(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Decision Summary Banner */}
            {selectedTranscriptCall.ai_summary && (
              <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/40 text-xs text-purple-200">
                <strong>🤖 AI Summary:</strong> {selectedTranscriptCall.ai_summary}
              </div>
            )}

            {/* Full Transcript Box */}
            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
              {selectedTranscriptCall.transcript || 'Transcript available nahi hai.'}
            </div>

            <button
              onClick={() => setSelectedTranscriptCall(null)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Transcript
            </button>

          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Import Orders & Real Phone Numbers</h3>
                  <p className="text-[10px] text-slate-400">Upload Shopify or Shiprocket exported CSV file</p>
                </div>
              </div>

              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-center">
              <p className="text-xs text-slate-300 leading-relaxed">
                Shopify me **Orders ➔ Export** ya Shiprocket me **Orders ➔ Export** se download ki hui **`.csv` file** yahan select karein:
              </p>

              <label className="tap-target py-4 px-6 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/80 border-2 border-dashed border-emerald-500/60 flex flex-col items-center justify-center gap-2 cursor-pointer transition">
                <Upload className="w-8 h-8 text-emerald-400 animate-bounce-subtle" />
                <span className="text-xs font-bold text-white">Select `.csv` File from Laptop/Phone</span>
                <span className="text-[10px] text-emerald-400">Instant Unmasked Numbers Sync</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
              </label>

              {importStatus && (
                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs font-semibold text-emerald-300">
                  {importStatus}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowImportModal(false)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {/* WhatsApp Sender Modal */}
      {activeWhatsappOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
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

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Customer Mobile Number (10 Digits):</span>
                {targetPhone && (
                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copyPhoneSuccess ? 'Number Copied! ✅' : 'Copy'}</span>
                  </button>
                )}
              </label>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-700">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile (e.g. 9876543210)"
                  className="flex-1 bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

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
                rows={6}
                value={customWaMessage}
                onChange={(e) => setCustomWaMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenWhatsAppWeb}
                className="tap-target py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition active:scale-95"
              >
                <Monitor className="w-4 h-4" />
                <span>Open WhatsApp Web (PC) ➔</span>
              </button>

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
                <h3 className="font-extrabold text-base text-white">Telecaller SOP & Maya AI Calling Rules</h3>
              </div>
              <button
                onClick={() => setShowSopModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {`🤖 **Maya AI Voice Calling Guidelines:**
1. **Auto-COD Confirmation:** Maya automatically checks customer name, order items, ₹449 COD amount and delivery address.
2. **Fake Order Prevention:** If customer says "Maine order nahi kiya" or wants cancel, Maya notes the exact reason and flags "DO NOT SHIP" in the dashboard.
3. **Cross-sell:** Confirmed customers are offered Smilika Sunscreen combo with official code AMPARO50.
4. **Live Audio & Transcripts:** After call ends, click "Audio" or "Transcript" to inspect the call.`}
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
