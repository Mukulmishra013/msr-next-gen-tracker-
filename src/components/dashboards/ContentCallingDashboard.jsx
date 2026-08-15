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

  // AI Calling States & Direct Dial Modal
  const [callingOrderId, setCallingOrderId] = useState(null);
  const [isBatchCalling, setIsBatchCalling] = useState(false);
  const [selectedAudioCall, setSelectedAudioCall] = useState(null);
  const [selectedTranscriptCall, setSelectedTranscriptCall] = useState(null);
  const [aiCallMessage, setAiCallMessage] = useState('');
  const [aiModalOrder, setAiModalOrder] = useState(null);
  const [aiModalPhone, setAiModalPhone] = useState('');

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

  // Handle Maya AI Call Click
  const handleAiCallButtonClick = (call) => {
    const cleanDigits = String(call.phone || '').replace(/\D/g, '');
    const isMasked = cleanDigits.length < 10 || String(call.phone || '').includes('xxx');

    if (isMasked) {
      setAiModalOrder(call);
      setAiModalPhone('');
    } else {
      executeAiCall(call, call.phone);
    }
  };

  // Execute Maya AI Phone Call
  const executeAiCall = async (call, phoneToUse) => {
    const cleanDigits = String(phoneToUse || '').replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      alert('Kripya valid 10-digit mobile number enter karein.');
      return;
    }

    const formattedPhone = `+91${cleanDigits}`;
    setCallingOrderId(call.id || call.shopify_order_id);
    setAiCallMessage('');

    // Save phone to DB
    await updateCallPhone(call.id, cleanDigits);

    try {
      const res = await triggerAiCall({
        id: call.id,
        shopify_order_id: call.shopify_order_id,
        phone: formattedPhone,
        customer_name: call.customer_name || 'Customer',
        product_name: call.product || 'Amparo Shilajit Gummies',
        order_amount: call.amount || 449,
        delivery_address: call.notes || 'India',
        delivery_timeline: 'तीन से पाँच दिन',
        combo_product: 'Smilika SPF 50 Sunscreen',
        combo_discount: 'एक सौ रुपये',
        customer_type: call.status === 'confirmed' ? 'OLD_CUSTOMER' : 'NEW_CUSTOMER',
        discount_value: 'पचास रुपये की छूट',
        coupon_code: 'AMPARO50'
      });

      setAiModalOrder(null);
      setAiCallMessage(`✅ Maya AI call initiated for ${call.customer_name} (${formattedPhone})!`);
      setTimeout(() => setAiCallMessage(''), 5000);
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

  // 1. WhatsApp Web Direct (PC/Laptop)
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

  // 2. WhatsApp Mobile App
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
      
      {/* Top Telecaller Header & Action Buttons */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-white">Maya AI Voice Calling & Telecaller Center</h2>
          </div>
          <p className="text-xs text-slate-300">
            Assigned: <strong className="text-emerald-400">{currentUser.name}</strong> — Autonomous AI Calling (Bolna.ai), Audio Transcripts & NDR Rescue.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          
          {/* ⚡ Batch Auto-Dial All Pending Orders Button */}
          <button
            onClick={handleTriggerBatchAiCalls}
            disabled={isBatchCalling}
            className="tap-target px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-yellow-300 animate-bounce-subtle" />
            <span>{isBatchCalling ? 'Batch Calling in Progress...' : '⚡ Auto-Dial All Pending Orders'}</span>
          </button>

          {/* 📁 Import CSV Button */}
          <button
            onClick={() => setShowImportModal(true)}
            className="tap-target px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import CSV</span>
          </button>

          {/* 📖 SOP Guide Button */}
          <button
            onClick={() => setShowSopModal(true)}
            className="tap-target px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>SOP Scripts</span>
          </button>
        </div>
      </div>

      {/* AI Call Feedback Alert Bar */}
      {aiCallMessage && (
        <div className="p-3.5 rounded-2xl bg-purple-950/80 border border-purple-500/60 text-purple-200 text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-950/40 animate-scale-up">
          <Bot className="w-4 h-4 text-yellow-300 animate-spin" />
          <span>{aiCallMessage}</span>
        </div>
      )}

      {/* Live Caller KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Maya AI Calls</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{aiCallsCount}</p>
          <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Autonomous Bolna.ai calls</p>
        </div>

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
          <p className="text-[10px] text-red-300 font-semibold mt-0.5">High return risk</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Pending Calls</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">Awaiting verification</p>
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

      {/* Customer Calling Queue with Maya AI & Audio/Transcript Actions */}
      <div className="glass-card rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
        
        {/* Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-purple-400" />
              <span>Customer Calling Queue ({amparoCalls.length} Real Orders)</span>
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
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
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
              const cleanDigits = String(call.phone || '').replace(/\D/g, '');
              const isMasked = cleanDigits.length < 10 || String(call.phone || '').includes('xxx');
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

                      {/* AI Conversation Snippet / Notes */}
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-slate-400 truncate max-w-md">
                          {call.ai_summary ? `🤖 Maya: "${call.ai_summary}"` : call.notes}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons Matrix */}
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {/* 🤖 Trigger Maya AI Call Button (Always Clickable) */}
                      <button
                        onClick={() => handleAiCallButtonClick(call)}
                        disabled={isCallingThis}
                        className={`tap-target px-3.5 py-2 rounded-xl text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 ${
                          isCallingThis
                            ? 'bg-purple-700 cursor-wait animate-pulse'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                        }`}
                        title="Maya AI se direct call lagayein"
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
                          className="tap-target px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition active:scale-95"
                          title="Read Full Dialogue Transcript"
                        >
                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                          <span>Transcript</span>
                        </button>
                      )}

                      {/* Manual Phone Call Link */}
                      <a
                        href={`tel:${call.phone}`}
                        className="tap-target px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition active:scale-95"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                        <span>Manual</span>
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
              );
            })
          )}
        </div>

      </div>

      {/* Maya AI Direct Dial Modal (If Phone Missing or Confirming) */}
      {aiModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/60 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Maya AI Voice Calling</h3>
                  <p className="text-[10px] text-slate-400">Order: {aiModalOrder.customer_name} ({aiModalOrder.shopify_order_id})</p>
                </div>
              </div>

              <button
                onClick={() => setAiModalOrder(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Customer Mobile Number to Dial:
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-400 bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-700">
                  +91
                </span>
                <input
                  type="tel"
                  autoFocus
                  maxLength={10}
                  value={aiModalPhone}
                  onChange={(e) => setAiModalPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="flex-1 bg-slate-900 border border-purple-500/50 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Product: {aiModalOrder.product} (COD: ₹{aiModalOrder.amount})
              </p>
            </div>

            <button
              onClick={() => executeAiCall(aiModalOrder, aiModalPhone)}
              disabled={callingOrderId !== null || aiModalPhone.length < 10}
              className="tap-target w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
            >
              <Bot className="w-4 h-4 text-yellow-300" />
              <span>{callingOrderId ? 'Calling In Progress...' : '🚀 Start Maya AI Voice Call Now'}</span>
            </button>

          </div>
        </div>
      )}

      {/* 🎧 In-App Audio Recording Player Modal */}
      {selectedAudioCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Maya AI Call Audio Recording</h3>
                  <p className="text-[10px] text-slate-400">Customer: {selectedAudioCall.customer_name} ({selectedAudioCall.phone})</p>
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
              <p className="text-xs text-slate-300">
                Order: <strong className="text-emerald-400">{selectedAudioCall.shopify_order_id}</strong> | Product: {selectedAudioCall.product}
              </p>
              
              <audio
                controls
                autoPlay
                src={selectedAudioCall.recording_url}
                className="w-full rounded-xl mt-2"
              >
                Your browser does not support audio element.
              </audio>
            </div>

            <button
              onClick={() => setSelectedAudioCall(null)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5"
            >
              Close Player
            </button>

          </div>
        </div>
      )}

      {/* 📜 Full Dialogue Transcript Modal */}
      {selectedTranscriptCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Maya AI Call Transcript</h3>
                  <p className="text-[10px] text-slate-400">{selectedTranscriptCall.customer_name} ({selectedTranscriptCall.phone})</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTranscriptCall(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-80 overflow-y-auto space-y-2 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {selectedTranscriptCall.transcript}
            </div>

            <button
              onClick={() => setSelectedTranscriptCall(null)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5"
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

            {/* Customer Phone Field (Direct 10-Digit Input) */}
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
                rows={6}
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
                <span>Open WhatsApp Web (PC) ➔</span>
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
1. **Autonomous Dialing:** Maya AI Bolna engine customer ko direct Hindi/Hinglish me natural human voice me call karegi.
2. **Order Confirmation:** Maya customer se product (${filteredCalls[0]?.product || 'Amparo Shilajit'}) & COD amount confirm karegi.
3. **Auto Action:**
   • Confirm hone par ➔ Auto Dispatched & Ship Badge.
   • Cancel / Fake hone par ➔ 🔴 Cancel (Do Not Ship) & Shopify Cancel tag.
   • Reschedule hone par ➔ Rescheduled date logged in notes.`}
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
