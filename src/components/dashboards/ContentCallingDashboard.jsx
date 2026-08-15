// Telecaller, Maya AI HR Duty Manager (Daily 10 Tasks), Incentive Engine & Shiprocket Center
import React, { useState, useMemo } from 'react';
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
  Ban,
  Search,
  RefreshCw,
  Users,
  Repeat,
  ShoppingBag,
  Award,
  ListTodo,
  Check,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export function ContentCallingDashboard({ onOpenChat }) {
  const { currentUser } = useAuth();
  const { 
    amparoCalls, 
    setAmparoCalls, 
    incentives, 
    updateCallStatus, 
    updateCallPhone,
    claimTelecallerTaskIncentive,
    triggerAiCall,
    triggerBatchAiCalls 
  } = useAppData();

  const [activeCallTab, setActiveCallTab] = useState('daily_duty'); // default to Maya AI Daily Duty!
  const [searchQuery, setSearchQuery] = useState('');
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
  const [isSyncingSr, setIsSyncingSr] = useState(false);

  // AI Calling States & Direct Dial Modal
  const [callingOrderId, setCallingOrderId] = useState(null);
  const [isBatchCalling, setIsBatchCalling] = useState(false);
  const [selectedAudioCall, setSelectedAudioCall] = useState(null);
  const [selectedTranscriptCall, setSelectedTranscriptCall] = useState(null);
  const [aiCallMessage, setAiCallMessage] = useState('');
  const [aiModalOrder, setAiModalOrder] = useState(null);
  const [aiModalPhone, setAiModalPhone] = useState('');
  const [aiModalPurpose, setAiModalPurpose] = useState('ORDER_CONFIRMATION');

  // Stats & Performance
  const userIncentives = incentives.filter((i) => i.user_id === currentUser.id);
  const totalIncentive = userIncentives.reduce((sum, item) => sum + item.amount, 0);

  const confirmedCalls = amparoCalls.filter((c) => c.status === 'confirmed').length;
  const rtoSavedCalls = amparoCalls.filter((c) => c.status === 'rto_saved').length;
  const urgentCount = amparoCalls.filter((c) => c.urgent_rto).length;
  const pendingCount = amparoCalls.filter((c) => c.status === 'pending_confirmation').length;
  const aiCallsCount = amparoCalls.filter((c) => c.call_source === 'ai_agent' || c.recording_url || c.transcript || (c.notes && c.notes.includes('[AI_LOG]'))).length;
  const oldCustomersCount = amparoCalls.filter((c) => c.call_type === 'Old Customer Feedback' || c.status === 'confirmed' || c.status === 'delivered').length;
  const fakeCancelledCount = amparoCalls.filter((c) => c.status === 'rto_lost' || c.ai_decision === 'fake_order').length;

  // 🎯 Maya AI HR: Dynamic Generation of 10 Daily Duty Targets
  const daily10Tasks = useMemo(() => {
    const rtoTargets = amparoCalls.filter((c) => c.urgent_rto).slice(0, 4).map((c) => ({
      ...c,
      task_type: 'RTO_RESCUE',
      task_title: '🚨 Urgent RTO Rescue',
      incentive_amount: 50,
      badge_color: 'bg-red-600',
      ai_tip: `Parcel delivery attempt fail hui hai. Customer se politely confirm karein ki delivery boy aaj re-attempt deliver karwa de. Manually save karne par +₹50 Live Incentive milega!`
    }));

    const oldTargets = amparoCalls.filter((c) => (c.call_type === 'Old Customer Feedback' || c.status === 'confirmed' || c.status === 'delivered') && !c.urgent_rto).slice(0, 4).map((c) => ({
      ...c,
      task_type: 'OLD_CUSTOMER_REORDER',
      task_title: '🌿 Customer Feedback & Re-Order',
      incentive_amount: 30,
      badge_color: 'bg-teal-600',
      ai_tip: `Purane customer se health results & experience puchiye. Agar satisfied hain toh ₹50 OFF coupon (AMPARO50) dekar COD repeat order book karein (+₹30 Incentive)!`
    }));

    const pendingTargets = amparoCalls.filter((c) => c.status === 'pending_confirmation' && !c.urgent_rto).slice(0, 2).map((c) => ({
      ...c,
      task_type: 'ORDER_CONFIRMATION',
      task_title: '⏳ COD Order Confirmation',
      incentive_amount: 20,
      badge_color: 'bg-amber-600',
      ai_tip: `Naya order dispatch confirm karke complete address & COD cash payment ready rakhne ko bolein (+₹20 Incentive)!`
    }));

    return [...rtoTargets, ...oldTargets, ...pendingTargets];
  }, [amparoCalls]);

  const completedDutyTasksCount = daily10Tasks.filter((t) => t.handled_by === currentUser.name || t.status === 'rto_saved' || t.call_source === 'telecaller_manual').length;
  const dutyIncentiveEarned = completedDutyTasksCount * 45; // average incentive

  const sortedCalls = [...amparoCalls].sort((a, b) => (b.urgent_rto ? 1 : 0) - (a.urgent_rto ? 1 : 0));
  
  const filteredCalls = sortedCalls.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.customer_name || '').toLowerCase().includes(q);
      const matchOrder = (c.shopify_order_id || '').toLowerCase().includes(q);
      const matchPhone = (c.phone || '').includes(q);
      const matchProd = (c.product || '').toLowerCase().includes(q);
      if (!matchName && !matchOrder && !matchPhone && !matchProd) return false;
    }

    if (activeCallTab === 'daily_duty') return true; // Handled separately in dedicated view
    if (activeCallTab === 'urgent_rto') return c.urgent_rto;
    if (activeCallTab === 'pending') return c.status === 'pending_confirmation';
    if (activeCallTab === 'old_customers') return c.call_type === 'Old Customer Feedback' || c.status === 'confirmed' || c.status === 'delivered';
    if (activeCallTab === 'ai_history') return Boolean(c.recording_url || c.transcript || c.call_source === 'ai_agent' || (c.notes && c.notes.includes('[AI_LOG]')));
    if (activeCallTab === 'ai_confirmed') return c.status === 'confirmed' || c.status === 'rto_saved';
    if (activeCallTab === 'ai_fake_cancelled') return c.status === 'rto_lost' || c.ai_decision === 'fake_order';
    return true;
  });

  // Handle Maya AI Call Click
  const handleAiCallButtonClick = (call, forcedPurpose = null) => {
    const isRto = Boolean(call.urgent_rto || call.call_type === 'RTO Rescue');
    const isOldCust = Boolean(call.call_type === 'Old Customer Feedback' || call.status === 'confirmed' || call.status === 'delivered');
    const purpose = forcedPurpose || (isRto ? 'RTO_RESCUE' : (isOldCust ? 'OLD_CUSTOMER_FEEDBACK' : 'ORDER_CONFIRMATION'));

    setAiModalPurpose(purpose);
    const cleanDigits = String(call.phone || '').replace(/\D/g, '');
    const isMasked = cleanDigits.length < 10 || String(call.phone || '').includes('xxx');

    if (isMasked) {
      setAiModalOrder(call);
      setAiModalPhone('');
    } else {
      executeAiCall(call, call.phone, purpose);
    }
  };

  // Execute Maya AI Phone Call (Zero Incentive for Telecaller)
  const executeAiCall = async (call, phoneToUse, purposeToUse = null) => {
    const cleanDigits = String(phoneToUse || '').replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      alert('Kripya valid 10-digit mobile number enter karein.');
      return;
    }

    const formattedPhone = `+91${cleanDigits}`;
    setCallingOrderId(call.id || call.shopify_order_id);
    setAiCallMessage('');

    await updateCallPhone(call.id, cleanDigits);

    const isRto = Boolean(call.urgent_rto || call.call_type === 'RTO Rescue');
    const purpose = purposeToUse || aiModalPurpose || (isRto ? 'RTO_RESCUE' : (call.status === 'confirmed' ? 'OLD_CUSTOMER_FEEDBACK' : 'ORDER_CONFIRMATION'));

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
        customer_type: purpose === 'OLD_CUSTOMER_FEEDBACK' ? 'OLD_CUSTOMER' : 'NEW_CUSTOMER',
        call_purpose: purpose,
        is_rto: isRto,
        urgent_rto: isRto,
        discount_value: 'पचास रुपये की छूट',
        coupon_code: 'AMPARO50'
      });

      setAiModalOrder(null);
      const purposeLabel = purpose === 'OLD_CUSTOMER_FEEDBACK' ? '🌿 Feedback & Repeat Sales' : (isRto ? '🚨 Urgent RTO Rescue' : '📦 Order Confirmation');
      setAiCallMessage(`🤖 Maya AI calling ${call.customer_name} (${formattedPhone}) [Type: ${purposeLabel} | Note: AI call par telecaller incentive ₹0 hota hai]`);
      setTimeout(() => setAiCallMessage(''), 6000);
    } catch (err) {
      alert(`AI Call Error: ${err.message}`);
    } finally {
      setCallingOrderId(null);
    }
  };

  // 1-Click Batch AI Calling
  const handleTriggerBatchAiCalls = async (mode = 'pending') => {
    let targetQueue = [];
    if (mode === 'old_customers') {
      targetQueue = amparoCalls.filter(
        (c) => c.call_type === 'Old Customer Feedback' || c.status === 'confirmed' || c.status === 'delivered'
      );
      if (!window.confirm(`Kya aap ${targetQueue.length} Purane Customers par Maya AI se Feedback & Re-Order Campaign start karna chahte hain?`)) return;
    } else {
      targetQueue = amparoCalls.filter(
        (c) => c.status === 'pending_confirmation' || c.urgent_rto
      );
      if (!window.confirm(`Kya aap ${targetQueue.length} pending orders par Maya AI se Auto-Calling start karna chahte hain?`)) return;
    }

    if (targetQueue.length === 0) {
      alert('Is campaign me koi target orders nahi hain.');
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

  // Sync Live Shiprocket Orders
  const handleSyncShiprocket = async () => {
    setIsSyncingSr(true);
    setAiCallMessage('⚡ Shiprocket live orders fetch ho rahe hain...');
    try {
      const res = await fetch('/api/shiprocket-fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveSync: true })
      });
      const data = await res.json();
      if (data.success && data.orders) {
        setAmparoCalls(data.orders);
        setAiCallMessage(`✅ SUCCESS: ${data.orders.length} Shiprocket orders live synchronize ho gaye!`);
      } else {
        throw new Error(data.message || 'Sync error');
      }
    } catch (e) {
      setAiCallMessage(`❌ Sync Error: ${e.message}`);
    } finally {
      setIsSyncingSr(false);
      setTimeout(() => setAiCallMessage(''), 5000);
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

    if (order.call_type === 'Old Customer Feedback' || order.status === 'confirmed') {
      return `Namaste ${custName} Ji!

*Amparo Store* se special VIP customer connect! 🌿

Aapne pehle *${product}* order kiya tha. Aaj hamare loyal customers ke liye *₹50 OFF* coupon (*AMPARO50*) active hai.

Kya aapke liye agla pack Cash on Delivery book kar dein?

*Team Amparo Store* ✨`;
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
        setImportStatus(`✅ SUCCESS! ${data.orders.length} Real Orders load ho gaye!`);
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
      
      {/* 👑 Maya AI HR & Operations Manager Morning Duty Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-purple-600 text-white text-[11px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                Maya AI HR Agent (Groq Llama 3.3)
              </span>
              <span className="text-xs text-purple-300 font-bold">Daily Telecaller Duty Allocation</span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-black text-white">
              Namaste {currentUser.name}! Aaj ke Top 10 High-Impact Duty Tasks
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Maya AI ne customer orders analyze karke aapke liye <strong className="text-emerald-400">10 Priority Calls</strong> select kiye hain: 
              <strong className="text-red-400"> 4 Urgent RTO Rescues (+₹50/call)</strong>, 
              <strong className="text-teal-400"> 4 Old Customer Re-Orders (+₹30/call)</strong> aur 
              <strong className="text-amber-400"> 2 High-Value Confirmations (+₹20/call)</strong>. 
              <span className="text-yellow-300 font-semibold block mt-0.5">
                💡 Rule: Telecaller khud call/WhatsApp karke complete karega toh Live Cash Incentive milega. Maya AI se auto-dial karwayenge toh Telecaller incentive ₹0 hoga.
              </span>
            </p>
          </div>

          {/* Daily Progress Gauge */}
          <div className="bg-slate-950/80 border border-purple-500/50 rounded-2xl p-4 min-w-[220px] text-center space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Today's 10 Duty Targets:</span>
              <span className="text-emerald-400 font-mono font-black">{completedDutyTasksCount} / 10</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(completedDutyTasksCount / 10) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Daily Incentive Earned:</span>
              <span className="text-sm font-black font-mono text-emerald-400">₹{dutyIncentiveEarned}</span>
            </div>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2 flex-wrap border-t border-slate-800/80 pt-3">
          <button
            onClick={() => setActiveCallTab('daily_duty')}
            className={`tap-target px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition active:scale-95 ${
              activeCallTab === 'daily_duty'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ListTodo className="w-4 h-4 text-yellow-300" />
            <span>📋 Today's 10 Duty Tasks</span>
          </button>

          <button
            onClick={() => setActiveCallTab('all')}
            className={`tap-target px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
              activeCallTab !== 'daily_duty'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span>📦 All Orders Center ({amparoCalls.length})</span>
          </button>

          <button
            onClick={handleSyncShiprocket}
            disabled={isSyncingSr}
            className="tap-target px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncingSr ? 'animate-spin' : ''}`} />
            <span>Sync Shiprocket</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="tap-target px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import CSV</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="glass-card p-3.5 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Total Incentive</span>
            <Flame className="w-4 h-4 text-emerald-400 animate-bounce-subtle" />
          </div>
          <p className="text-xl font-black text-white mt-1">₹{totalIncentive.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Live Cash Ledger</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider">Urgent RTOs</span>
            <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <p className="text-xl font-black text-white mt-1">{urgentCount}</p>
          <p className="text-[10px] text-red-300 font-semibold mt-0.5">+₹50 per saved</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">Old Customers</span>
            <Repeat className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{oldCustomersCount}</p>
          <p className="text-[10px] text-teal-300 font-semibold mt-0.5">+₹30 per re-order</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Pending Calls</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{pendingCount}</p>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">+₹20 per confirm</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Maya AI Calls</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{aiCallsCount}</p>
          <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Autonomous</p>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/50 to-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">{confirmedCalls + rtoSavedCalls}</p>
          <p className="text-[10px] text-blue-300 font-semibold mt-0.5">Dispatched</p>
        </div>
      </div>

      {/* VIEW 1: 📋 MAYA AI DAILY 10 DUTY TASKS SECTION */}
      {activeCallTab === 'daily_duty' && (
        <div className="space-y-4">
          <div className="glass-card rounded-3xl border border-purple-500/40 p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-yellow-300" />
                  <span>Maya AI Daily 10 Duty Targets (Assigned to {currentUser.name})</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Manual Call / WhatsApp karne par Live Cash Incentive claim karein.
                </p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-bold font-mono">
                {completedDutyTasksCount} / 10 Completed
              </span>
            </div>

            {/* 10 Duty Tasks Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daily10Tasks.map((task, idx) => {
                const isCompleted = task.handled_by === currentUser.name || task.status === 'rto_saved' || task.call_source === 'telecaller_manual';
                const cleanDigits = String(task.phone || '').replace(/\D/g, '');
                const isMasked = cleanDigits.length < 10 || String(task.phone || '').includes('xxx');
                const displayPhone = isMasked ? 'Enter Mobile' : task.phone;

                return (
                  <div
                    key={task.id || task.shopify_order_id || idx}
                    className={`p-4 rounded-2xl border transition relative space-y-3 ${
                      isCompleted
                        ? 'bg-emerald-950/30 border-emerald-500/60'
                        : task.task_type === 'RTO_RESCUE'
                        ? 'bg-red-950/20 border-red-500/50 hover:border-red-400'
                        : task.task_type === 'OLD_CUSTOMER_REORDER'
                        ? 'bg-teal-950/20 border-teal-500/50 hover:border-teal-400'
                        : 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {/* Task Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center font-mono">
                          #{idx + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white uppercase tracking-wider ${task.badge_color}`}>
                          {task.task_title}
                        </span>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-black font-mono">
                        +₹{task.incentive_amount} Incentive
                      </span>
                    </div>

                    {/* Customer & Product Info */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-white">{task.customer_name}</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">₹{task.amount} ({task.shopify_order_id})</span>
                      </div>

                      {/* Phone with Inline Edit */}
                      <div className="flex items-center gap-2">
                        {editingPhoneId === task.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="tel"
                              autoFocus
                              value={editingPhoneVal}
                              onChange={(e) => setEditingPhoneVal(e.target.value)}
                              placeholder="Enter 10-digit number"
                              className="bg-slate-950 border border-emerald-500 rounded-lg px-2 py-0.5 text-xs font-mono text-emerald-300 w-32 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSavePhoneInline(task.id)}
                              className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                            >
                              <Save className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingPhoneId(task.id);
                              setEditingPhoneVal(isMasked ? '' : String(task.phone).replace(/\D/g, '').slice(-10));
                            }}
                            className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg flex items-center gap-1 transition ${
                              isMasked
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                                : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            <Phone className="w-3 h-3 text-amber-400" />
                            <span>{displayPhone}</span>
                            <Edit3 className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                          </button>
                        )}
                        <p className="text-xs text-slate-300 truncate max-w-xs">{task.product}</p>
                      </div>
                    </div>

                    {/* 💡 Maya AI Smart Calling Tip (Groq Llama 3.3) */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 text-[11px] text-purple-200 leading-relaxed flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-yellow-300 shrink-0 mt-0.5" />
                      <span>{task.ai_tip}</span>
                    </div>

                    {/* Action Buttons Matrix */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                      
                      {/* Telecaller Manual Tools (Earn Incentive) */}
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${task.phone}`}
                          className="tap-target px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3 text-emerald-400" />
                          <span>Call</span>
                        </a>

                        <button
                          onClick={() => handleOpenWhatsappModal(task)}
                          className="tap-target px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>
                      </div>

                      {/* Claim Incentive Button vs AI Auto-Dial */}
                      <div className="flex items-center gap-1.5">
                        {isCompleted ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-md">
                            <Check className="w-3.5 h-3.5" />
                            <span>Done (+₹{task.incentive_amount})</span>
                          </span>
                        ) : (
                          <>
                            {/* Claim Manual Incentive */}
                            <button
                              onClick={() => claimTelecallerTaskIncentive(task.id || task.shopify_order_id, task.incentive_amount, task.task_title, currentUser)}
                              className="tap-target px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30 transition active:scale-95"
                            >
                              <Award className="w-3.5 h-3.5 text-yellow-300" />
                              <span>Done (+₹{task.incentive_amount})</span>
                            </button>

                            {/* Delegate to Maya AI (0 Incentive) */}
                            <button
                              onClick={() => handleAiCallButtonClick(task, task.task_type)}
                              className="tap-target px-2.5 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1"
                              title="Maya AI ko call karne dein (0 Telecaller Incentive)"
                            >
                              <Bot className="w-3 h-3 text-purple-400" />
                              <span>AI Dial (₹0)</span>
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: 📦 ALL ORDERS CENTER & SEARCH */}
      {activeCallTab !== 'daily_duty' && (
        <div className="glass-card rounded-3xl border border-slate-800 p-5 space-y-4">
          
          {/* Search Bar & Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-400" />
                  <span>Shiprocket Orders Center ({amparoCalls.length} Total Orders)</span>
                </h3>
                <p className="text-xs text-slate-400">1-Click Maya AI Calling, Audio Recordings, Re-Orders & Shopify Sync</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, order ID..."
                  className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-52 sm:w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: `All (${amparoCalls.length})` },
                  { id: 'urgent_rto', label: `🚨 Urgent RTO (${urgentCount})` },
                  { id: 'pending', label: `⏳ Pending (${pendingCount})` },
                  { id: 'old_customers', label: `🌿 Old Customers (${oldCustomersCount})` },
                  { id: 'ai_history', label: `🎧 AI Logs & Audio (${aiCallsCount})` },
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
          </div>

          {/* Calls List */}
          <div className="space-y-3">
            {filteredCalls.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
                <PackageCheck className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">Is filter me koi orders nahi mile.</p>
              </div>
            ) : (
              filteredCalls.map((call) => {
                const cleanDigits = String(call.phone || '').replace(/\D/g, '');
                const isMasked = cleanDigits.length < 10 || String(call.phone || '').includes('xxx');
                const displayPhone = isMasked ? 'Enter Mobile' : call.phone;
                const isCallingThis = callingOrderId === (call.id || call.shopify_order_id);
                const isOldCustomer = call.call_type === 'Old Customer Feedback' || call.status === 'confirmed' || call.status === 'delivered';

                return (
                  <div
                    key={call.id || call.shopify_order_id}
                    className={`p-4 rounded-2xl border transition ${
                      call.status === 'calling_in_progress'
                        ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-950/30'
                        : call.urgent_rto
                        ? 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/30'
                        : isOldCustomer
                        ? 'bg-teal-950/20 border-teal-500/40'
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
                          {isOldCustomer && (
                            <span className="bg-teal-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Repeat className="w-3 h-3" />
                              OLD CUSTOMER
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
                        
                        {/* 🤖 Trigger Maya AI Call Button */}
                        <button
                          onClick={() => handleAiCallButtonClick(call, isOldCustomer ? 'OLD_CUSTOMER_FEEDBACK' : null)}
                          disabled={isCallingThis}
                          className={`tap-target px-3.5 py-2 rounded-xl text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 ${
                            isCallingThis
                              ? 'bg-purple-700 cursor-wait animate-pulse'
                              : isOldCustomer
                              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-600/30'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30'
                          }`}
                        >
                          <Bot className={`w-3.5 h-3.5 text-yellow-300 ${isCallingThis ? 'animate-spin' : ''}`} />
                          <span>{isCallingThis ? 'Calling...' : (isOldCustomer ? 'Maya Re-Order Call' : 'Maya AI Call')}</span>
                        </button>

                        {/* 🎧 Listen Audio Recording Button (If Available) */}
                        {call.recording_url && (
                          <button
                            onClick={() => setSelectedAudioCall(call)}
                            className="tap-target px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
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
      )}

      {/* Maya AI Direct Dial Modal (If Phone Missing or Confirming) */}
      {aiModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-purple-500/60 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Maya AI Voice Calling</h3>
                  <p className="text-[10px] text-slate-400">
                    Order: {aiModalOrder.customer_name} ({aiModalOrder.shopify_order_id})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAiModalOrder(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Purpose Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-300">Calling Purpose:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAiModalPurpose('ORDER_CONFIRMATION')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    aiModalPurpose === 'ORDER_CONFIRMATION'
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  📦 Order Confirmation
                </button>
                <button
                  type="button"
                  onClick={() => setAiModalPurpose('OLD_CUSTOMER_FEEDBACK')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                    aiModalPurpose === 'OLD_CUSTOMER_FEEDBACK'
                      ? 'bg-teal-600 text-white border-teal-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  🌿 Feedback & Re-Order
                </button>
              </div>
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
              onClick={() => executeAiCall(aiModalOrder, aiModalPhone, aiModalPurpose)}
              disabled={callingOrderId !== null || aiModalPhone.length < 10}
              className="tap-target w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
            >
              <Bot className="w-4 h-4 text-yellow-300" />
              <span>{callingOrderId ? 'Calling In Progress...' : '🚀 Start Maya AI Voice Call (₹0 Incentive)'}</span>
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
              {`🤖 **Maya AI Voice Calling SOP Guidelines:**
1. **New Order Confirmation:** Maya confirms product, address & COD amount.
2. **🚨 RTO Rescue (+₹50 Incentive):** Maya coordinates courier re-attempt with buyers whose delivery attempt failed.
3. **🌿 Old Customer Re-Order (+₹30 Incentive):** Maya calls delivered customers for health feedback & books repeat purchases with ₹50 OFF coupon (AMPARO50).
4. **Incentive Rule:**
   • Telecaller khud manually call / WhatsApp karke Done karega ➔ Direct Live Cash Incentive added!
   • Maya AI auto-dial karegi ➔ ₹0 Telecaller incentive.`}
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
