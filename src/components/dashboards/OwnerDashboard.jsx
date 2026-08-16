// Owner & Director Command Center (Revenue, Growth Pool, Maya AI Voice Calling, Attendance, Shiprocket Live Orders & Employee Management)
import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAgents } from '../../context/AgentContext';
import { SalaryBreakdownCard } from '../payroll/SalaryBreakdownCard';
import { EmployeeManagement } from '../admin/EmployeeManagement';
import { ShiprocketSyncModal } from '../admin/ShiprocketSyncModal';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  RefreshCw, 
  Gift, 
  Truck, 
  PhoneCall, 
  Search, 
  Package, 
  AlertCircle,
  FileText,
  Zap,
  Ban,
  ExternalLink,
  Sliders,
  Save,
  Tag,
  Check,
  X,
  Bot,
  Volume2,
  MessageSquare,
  Phone,
  Clock,
  Smartphone,
  Eye,
  Lightbulb,
  Calendar
} from 'lucide-react';

export function OwnerDashboard({ onOpenUpiModal, onOpenChat }) {
  const { 
    amparoCalls, 
    msrLeads, 
    videos, 
    fieldVisits, 
    attendance, 
    revenueLog, 
    payroll, 
    updateCallStatus,
    triggerAiCall,
    triggerBatchAiCalls,
    mayaConfig,
    updateMayaConfig,
    syncBolnaExecutions
  } = useAppData();

  const { sendMessageToAgent } = useAgents();
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState('');
  const [activeOwnerTab, setActiveOwnerTab] = useState('overview'); // 'overview' | 'ai_calling' | 'orders' | 'employees' | 'payroll'
  const [isShiprocketModalOpen, setIsShiprocketModalOpen] = useState(false);
  const [isMayaConfigOpen, setIsMayaConfigOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudioCall, setSelectedAudioCall] = useState(null);
  const [selectedTranscriptCall, setSelectedTranscriptCall] = useState(null);
  const [isBatchCalling, setIsBatchCalling] = useState(false);
  const [configSaveMsg, setConfigSaveMsg] = useState('');
  const [isSyncingAi, setIsSyncingAi] = useState(false);

  // Customer 360° AI Intelligence & Action Hub State
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [detailActiveTab, setDetailActiveTab] = useState('ai_audit');
  const [detailWaMessage, setDetailWaMessage] = useState('');

  const handleSyncAiHistory = async () => {
    setIsSyncingAi(true);
    try {
      const res = await syncBolnaExecutions();
      if (res.success) {
        alert(`⚡ SUCCESS: ${res.count || 0} Maya AI calls, audio recordings & transcripts synchronized!`);
      } else {
        alert(`⚠️ Sync Notice: ${res.error || 'Check Bolna API connectivity'}`);
      }
    } catch (e) {
      alert(`❌ Sync Error: ${e.message}`);
    } finally {
      setIsSyncingAi(false);
    }
  };

  const handleOpenCustomer360 = (call) => {
    setSelectedCustomerDetail(call);
    setDetailActiveTab('ai_audit');
    const name = call.customer_name && call.customer_name !== 'Verified Buyer' ? call.customer_name : 'Customer';
    const prod = call.product || 'Amparo Shilajit Gummies';
    const id = call.shopify_order_id || '#Order';
    setDetailWaMessage(`Namaste ${name} Ji!\n\nAapka *Amparo Store* se order *${prod}* (${id}) successfully confirm ho gaya hai. 🌿\n\n💵 *COD Amount:* ₹${call.amount || 449}\n\nDhanyawad! Team Amparo Store 🌿`);
  };

  const [tempConfig, setTempConfig] = useState(mayaConfig || {
    enableDiscounts: true,
    rtoDiscountAmount: 50,
    rtoDiscountText: 'पचास रुपये की छूट',
    rtoCouponCode: 'AMPARO50',
    vipDiscountAmount: 50,
    vipDiscountText: 'पचास रुपये की विशेष छूट',
    vipCouponCode: 'AMPARO50',
    comboProduct: 'Smilika SPF 50 Sunscreen',
    comboDiscountAmount: 100,
    comboDiscountText: 'एक सौ रुपये की छूट',
    enableCrossSell: true,
    deliveryTimeline: 'तीन से पाँच दिन',
    brandName: 'Amparo Store'
  });

  const safeRev = revenueLog || { total_revenue: 124500, growth_amount: 18500, bonus_pool_8pct: 9960 };

  // Calculations
  const totalCalls = amparoCalls.length;
  const savedRtoCount = amparoCalls.filter((c) => c.status === 'rto_saved').length;
  const urgentRtoCount = amparoCalls.filter((c) => c.urgent_rto).length;
  const pendingCallsCount = amparoCalls.filter((c) => c.status === 'pending_confirmation').length;
  const deliveredCount = amparoCalls.filter((c) => c.status === 'confirmed').length;
  const aiCallsCount = amparoCalls.filter((c) => c.call_source === 'ai_agent').length;
  const manualCallsCount = totalCalls - aiCallsCount;
  const fakeCancelledCount = amparoCalls.filter((c) => c.status === 'rto_lost' || c.ai_decision === 'fake_order').length;
  const savedRtoRevenue = (savedRtoCount + fakeCancelledCount) * 150; // Average ₹150 courier RTO charge saved per fake order avoided

  const totalRtoAttempted = amparoCalls.filter((c) => c.call_type === 'RTO Rescue').length || 1;
  const rtoRecoveryRate = totalRtoAttempted > 0 ? Math.round((savedRtoCount / totalRtoAttempted) * 100) : 0;

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const outsideOfficeCount = attendance.filter((a) => a.status === 'outside_office').length;

  const filteredOrders = amparoCalls.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.customer_name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.shopify_order_id?.toLowerCase().includes(q) ||
      c.notes?.toLowerCase().includes(q) ||
      c.ai_summary?.toLowerCase().includes(q)
    );
  });

  const handleGenerateAiSummary = async () => {
    setAiSummaryLoading(true);
    try {
      const summary = `👑 **MSR Next Gen — Mukul Mishra Executive Brief**
• **Revenue & Growth:** Current Revenue ₹${safeRev.total_revenue?.toLocaleString('en-IN') || '1,24,500'}. 8% Growth bonus pool ₹${safeRev.bonus_pool_8pct || '9,960'} active hai.
• **Maya AI Autonomous Calling:** ${aiCallsCount} AI calls made (${savedRtoCount} RTOs saved, ${fakeCancelledCount} fake/cancelled orders caught). Estimated courier loss saved: ₹${savedRtoRevenue.toLocaleString('en-IN')}.
• **Shiprocket & Orders:** Total ${totalCalls} live orders in database (${urgentRtoCount} Urgent RTOs, ${pendingCallsCount} Pending Confirmation calls, ${deliveredCount} Confirmed).
• **Attendance & Geofence:** ${presentCount} team members present inside 200m GKP office geofence.`;

      setAiSummaryText(summary);
      sendMessageToAgent('Generate executive brief for Mukul Mishra', {
        revenue: safeRev,
        attendance,
        rtoRecoveryRate,
        totalCalls,
        urgentRtoCount,
        aiCallsCount
      });
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleAdminBatchDial = async () => {
    const pendingList = amparoCalls.filter((c) => c.status === 'pending_confirmation' || c.urgent_rto);
    if (pendingList.length === 0) {
      alert('Sabhi orders already processed hain!');
      return;
    }
    if (!window.confirm(`Admin Action: Start Maya AI calling on all ${pendingList.length} pending orders?`)) return;

    setIsBatchCalling(true);
    try {
      const res = await triggerBatchAiCalls(pendingList);
      alert(`⚡ SUCCESS: ${res.total_triggered || pendingList.length} Calls Maya AI ne queue kar di hain!`);
    } catch (e) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsBatchCalling(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Welcome Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <h2 className="text-lg sm:text-xl font-black text-white">Mukul Mishra Admin Control Center</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            Real Shiprocket Orders, Maya AI Calling Telemetry, GPS Haaziri & 1-Tap UPI Payroll.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAdminBatchDial}
            disabled={isBatchCalling}
            className="tap-target px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95"
          >
            <Zap className="w-4 h-4 text-yellow-300 animate-bounce-subtle" />
            <span>{isBatchCalling ? 'Calling...' : `⚡ Auto-Dial (${pendingCallsCount})`}</span>
          </button>

          <button
            onClick={() => setIsShiprocketModalOpen(true)}
            className="tap-target px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <Truck className="w-4 h-4" />
            <span>⚡ Sync Shiprocket</span>
          </button>

          <button
            onClick={() => {
              setTempConfig(mayaConfig);
              setIsMayaConfigOpen(true);
            }}
            className="tap-target px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs font-extrabold flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>🎛️ AI Discount Policy</span>
          </button>

          <button
            onClick={handleGenerateAiSummary}
            disabled={aiSummaryLoading}
            className="tap-target px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 text-xs font-extrabold flex items-center justify-center gap-2 transition active:scale-95"
          >
            {aiSummaryLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-yellow-300" />
            )}
            <span>AI Brief</span>
          </button>
        </div>
      </div>

      {/* AI Summary Card */}
      {aiSummaryText && (
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-purple-500/40 bg-purple-950/30 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Maya AI Strategic Brief (Hinglish)</span>
            </h4>
            <button
              onClick={() => onOpenChat()}
              className="text-[11px] text-purple-300 font-bold hover:underline"
            >
              Discuss in Chat ➔
            </button>
          </div>
          <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
            {aiSummaryText}
          </div>
        </div>
      )}

      {/* Admin Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: '📊 Financial & Operations' },
          { id: 'ai_calling', label: `🤖 Maya AI Calling Analytics (${aiCallsCount})` },
          { id: 'orders', label: `📦 Shiprocket Orders (${totalCalls})` },
          { id: 'employees', label: '👥 Employee Management' },
          { id: 'payroll', label: '💸 UPI Payroll' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveOwnerTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeOwnerTab === tab.id
                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeOwnerTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">August Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{safeRev.total_revenue?.toLocaleString('en-IN') || '1,24,500'}</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">+₹{safeRev.growth_amount?.toLocaleString('en-IN') || '18,500'} Growth</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">RTO Courier Saved</span>
                <ShieldCheck className="w-4 h-4 text-purple-400 animate-bounce-subtle" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{savedRtoRevenue.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-purple-300 font-semibold mt-0.5">{savedRtoCount + fakeCancelledCount} fake orders prevented</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">8% Growth Pool</span>
                <Gift className="w-4 h-4 text-amber-400 animate-bounce-subtle" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{safeRev.bonus_pool_8pct?.toLocaleString('en-IN') || '9,960'}</p>
              <p className="text-[10px] text-amber-300 font-semibold mt-0.5">Active for qualified staff</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">GPS Attendance</span>
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">{presentCount} Present</p>
              <p className="text-[10px] text-blue-300 font-semibold mt-0.5">{outsideOfficeCount} Outside Geofence</p>
            </div>
          </div>

          <SalaryBreakdownCard onOpenUpiModal={onOpenUpiModal} />
        </>
      )}

      {/* AI Voice Calling Analytics Tab */}
      {activeOwnerTab === 'ai_calling' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-4 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 to-slate-900">
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Total AI Calls</span>
              <p className="text-2xl font-black text-white mt-1">{aiCallsCount}</p>
              <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Bolna Voice Agent</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 to-slate-900">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">AI Confirmed & Ship</span>
              <p className="text-2xl font-black text-white mt-1">{deliveredCount}</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">High delivery intent</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/50 to-slate-900">
              <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider">Fake / Cancelled</span>
              <p className="text-2xl font-black text-white mt-1">{fakeCancelledCount}</p>
              <p className="text-[10px] text-red-300 font-semibold mt-0.5">RTO fee saved</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/50 to-slate-900">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Manual Calls</span>
              <p className="text-2xl font-black text-white mt-1">{manualCallsCount}</p>
              <p className="text-[10px] text-blue-300 font-semibold mt-0.5">Telecaller handled</p>
            </div>
          </div>

          {/* AI Call Logs Table */}
          <div className="glass-card rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>Autonomous AI Voice Call Execution Logs</span>
              </h3>

              <button
                onClick={handleSyncAiHistory}
                disabled={isSyncingAi}
                className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-purple-950/40"
              >
                <Bot className={`w-3.5 h-3.5 text-purple-400 ${isSyncingAi ? 'animate-spin' : ''}`} />
                <span>{isSyncingAi ? 'Syncing...' : '🔄 Sync AI History & Audio'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Customer / Order</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">AI Decision</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Action</th>
                    <th className="p-3 text-right">360° Audit & Recording</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {amparoCalls.map((call) => (
                    <tr key={call.id || call.shopify_order_id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3">
                        <p className="font-bold text-white">{call.customer_name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{call.shopify_order_id}</p>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{call.phone}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          call.status === 'confirmed' || call.status === 'rto_saved'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : call.status === 'rto_lost' || call.ai_decision === 'fake_order'
                            ? 'bg-red-950 text-red-300 border-red-500/40'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                        }`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {call.call_duration_seconds ? `${call.call_duration_seconds}s` : '—'}
                      </td>
                      <td className="p-3 text-[11px] text-slate-300">
                        {call.action_required || 'ship_immediately'}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenCustomer360(call)}
                          className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200 text-[11px] font-bold inline-flex items-center gap-1 shadow-sm transition active:scale-95"
                          title="View complete 360° AI recording, transcript, WhatsApp & Actions"
                        >
                          <Eye className="w-3.5 h-3.5 text-purple-300" />
                          <span>👁️ 360° Audit</span>
                        </button>

                        {call.recording_url && (
                          <button
                            onClick={() => handleOpenCustomer360(call)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <Volume2 className="w-3 h-3 text-emerald-400" />
                            <span>Play</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeOwnerTab === 'orders' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</p>
              <p className="text-xl font-black text-white mt-0.5">{totalCalls}</p>
            </div>
            <div className="glass-card p-3.5 rounded-xl border border-red-500/30 bg-red-950/30">
              <p className="text-[10px] font-bold text-red-300 uppercase">🚨 Urgent RTOs</p>
              <p className="text-xl font-black text-red-300 mt-0.5">{urgentRtoCount}</p>
            </div>
            <div className="glass-card p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/30">
              <p className="text-[10px] font-bold text-amber-300 uppercase">Pending Calls</p>
              <p className="text-xl font-black text-amber-300 mt-0.5">{pendingCallsCount}</p>
            </div>
            <div className="glass-card p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30">
              <p className="text-[10px] font-bold text-emerald-300 uppercase">Confirmed (Ship)</p>
              <p className="text-xl font-black text-emerald-300 mt-0.5">{deliveredCount}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name, phone, order ID, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={() => setIsShiprocketModalOpen(true)}
              className="tap-target px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 self-start"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Shiprocket API Now</span>
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl border border-slate-800 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Shiprocket orders loaded yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click <strong>"Sync Shiprocket API Now"</strong> to import all past and active shipments from your Shiprocket account.
              </p>
              <button
                onClick={() => setIsShiprocketModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
              >
                <Truck className="w-4 h-4" />
                <span>Import Existing Shiprocket Orders</span>
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Order / Customer</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Tracking / Courier</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Quick Call</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.map((order) => (
                    <tr key={order.id || order.shopify_order_id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          {order.urgent_rto && (
                            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded animate-pulse">
                              RTO
                            </span>
                          )}
                          <span>{order.customer_name}</span>
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">ID: {order.shopify_order_id}</p>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{order.phone}</td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">{order.product}</td>
                      <td className="p-3 font-bold text-emerald-400">₹{order.amount}</td>
                      <td className="p-3 text-[11px] text-slate-400">
                        {order.notes || order.shiprocket_shipment_id || 'In transit'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          order.urgent_rto
                            ? 'bg-red-950 text-red-300 border-red-500/40'
                            : order.status === 'confirmed'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <a
                          href={`tel:${order.phone}`}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Employees Management Tab */}
      {activeOwnerTab === 'employees' && <EmployeeManagement />}

      {/* Payroll Tab */}
      {activeOwnerTab === 'payroll' && <SalaryBreakdownCard onOpenUpiModal={onOpenUpiModal} />}

      {/* Shiprocket Sync Modal */}
      <ShiprocketSyncModal
        isOpen={isShiprocketModalOpen}
        onClose={() => setIsShiprocketModalOpen(false)}
      />

      {/* 🎧 Audio Recording Modal */}
      {selectedAudioCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Call Recording Player</h3>
                  <p className="text-[10px] text-slate-400">{selectedAudioCall.customer_name}</p>
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
              <audio controls autoPlay src={selectedAudioCall.recording_url} className="w-full rounded-xl mt-2">
                Your browser does not support audio.
              </audio>
              <a
                href={selectedAudioCall.recording_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:underline flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Audio in New Tab</span>
              </a>
            </div>

            <button
              onClick={() => setSelectedAudioCall(null)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 📜 Transcript Modal */}
      {selectedTranscriptCall && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/50 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Call Transcript</h3>
                  <p className="text-[10px] text-slate-400">{selectedTranscriptCall.customer_name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTranscriptCall(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
              {selectedTranscriptCall.transcript || 'Transcript available nahi hai.'}
            </div>

            <button
              onClick={() => setSelectedTranscriptCall(null)}
              className="tap-target w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 🎛️ MAYA AI VOICE, DISCOUNT & BRAND GUARDRAILS CONTROL MODAL */}
      {isMayaConfigOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Maya AI Discount & Policy Command Center</h3>
                  <p className="text-xs text-amber-300/80">Admin Rule: Maya bina aapki permission ke 1 rupya bhi extra discount nahi de sakti!</p>
                </div>
              </div>
              <button
                onClick={() => setIsMayaConfigOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {configSaveMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{configSaveMsg}</span>
              </div>
            )}

            {/* Config Form Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              
              {/* Master Discount Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Master Discount Permission</h4>
                  <p className="text-xs text-slate-400">Agar OFF karenge to Maya kisi bhi customer ko koi discount nahi bolegi.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tempConfig.enableDiscounts}
                    onChange={(e) => setTempConfig({ ...tempConfig, enableDiscounts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* RTO Rescue Discount Settings */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-red-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-red-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-red-300">RTO Rescue Objections Discount</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Discount Amount (₹)</label>
                    <input
                      type="number"
                      value={tempConfig.rtoDiscountAmount}
                      onChange={(e) => setTempConfig({
                        ...tempConfig,
                        rtoDiscountAmount: Number(e.target.value),
                        rtoDiscountText: `${e.target.value} रुपये की छूट`
                      })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">RTO Coupon Code</label>
                    <input
                      type="text"
                      value={tempConfig.rtoCouponCode}
                      onChange={(e) => setTempConfig({ ...tempConfig, rtoCouponCode: e.target.value.toUpperCase() })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Old Customer VIP Discount Settings */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-teal-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-teal-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-teal-300">Old Customer VIP Re-Order Discount</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">VIP Discount Amount (₹)</label>
                    <input
                      type="number"
                      value={tempConfig.vipDiscountAmount}
                      onChange={(e) => setTempConfig({
                        ...tempConfig,
                        vipDiscountAmount: Number(e.target.value),
                        vipDiscountText: `${e.target.value} रुपये की विशेष छूट`
                      })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">VIP Coupon Code</label>
                    <input
                      type="text"
                      value={tempConfig.vipCouponCode}
                      onChange={(e) => setTempConfig({ ...tempConfig, vipCouponCode: e.target.value.toUpperCase() })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Combo Cross-Sell Settings */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-purple-300">Combo Cross-Sell Pitch</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempConfig.enableCrossSell}
                      onChange={(e) => setTempConfig({ ...tempConfig, enableCrossSell: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Combo Product Name</label>
                    <input
                      type="text"
                      value={tempConfig.comboProduct}
                      onChange={(e) => setTempConfig({ ...tempConfig, comboProduct: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">Combo Discount Amount (₹)</label>
                    <input
                      type="number"
                      value={tempConfig.comboDiscountAmount}
                      onChange={(e) => setTempConfig({
                        ...tempConfig,
                        comboDiscountAmount: Number(e.target.value),
                        comboDiscountText: `${e.target.value} रुपये की छूट`
                      })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Timeline Guardrail */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="text-[11px] font-semibold text-slate-400">Official Delivery Timeline Promise</label>
                <input
                  type="text"
                  value={tempConfig.deliveryTimeline}
                  onChange={(e) => setTempConfig({ ...tempConfig, deliveryTimeline: e.target.value })}
                  placeholder="तीन से पाँच दिन"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Maya AI is timeline se kam ya zyada ka koi fake commitment nahi karegi.</p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsMayaConfigOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateMayaConfig(tempConfig);
                  setConfigSaveMsg('✅ Success: Maya AI Discount Rules Live Update Ho Gaye!');
                  setTimeout(() => {
                    setConfigSaveMsg('');
                    setIsMayaConfigOpen(false);
                  }, 1200);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save & Lock Policy</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🌟 CUSTOMER 360° AI CALL AUDIT & ACTION HUB MODAL (ADMIN) */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-scale-up">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-lg text-white">
                    {selectedCustomerDetail.customer_name || 'Customer'}
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-lg">
                    ₹{selectedCustomerDetail.amount || 449} COD
                  </span>
                  <span className="text-[11px] font-mono text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-lg">
                    {selectedCustomerDetail.shopify_order_id}
                  </span>
                  {selectedCustomerDetail.status === 'confirmed' && (
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      CONFIRMED
                    </span>
                  )}
                  {selectedCustomerDetail.status === 'rescheduled' && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                      RESCHEDULED
                    </span>
                  )}
                  {selectedCustomerDetail.status === 'rto_lost' && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                      CANCELLED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-emerald-300 font-bold">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {selectedCustomerDetail.phone || 'No Phone'}
                  </span>
                  <span>•</span>
                  <span className="text-slate-300 truncate max-w-[280px]">
                    📦 {selectedCustomerDetail.product}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomerDetail(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setDetailActiveTab('ai_audit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  detailActiveTab === 'ai_audit'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-yellow-300" />
                <span>🎙️ AI Call & Transcript</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('whatsapp')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  detailActiveTab === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
                <span>💬 WhatsApp & Offers</span>
              </button>

              <button
                onClick={() => setDetailActiveTab('logistics')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  detailActiveTab === 'logistics'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Truck className="w-3.5 h-3.5 text-blue-300" />
                <span>📦 Courier & Address</span>
              </button>
            </div>

            {/* Tab Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">

              {/* TAB 1: AI CALL INTELLIGENCE & AUDIO RECORDING */}
              {detailActiveTab === 'ai_audit' && (
                <div className="space-y-4">
                  {/* Audio Recording Player */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-emerald-400" />
                        Live Maya AI Call Recording
                      </span>
                      {selectedCustomerDetail.call_duration_seconds && (
                        <span className="text-[11px] font-mono text-slate-400 font-bold">
                          ⏱️ {selectedCustomerDetail.call_duration_seconds}s Duration
                        </span>
                      )}
                    </div>

                    {selectedCustomerDetail.recording_url ? (
                      <div className="pt-1">
                        <audio
                          controls
                          src={selectedCustomerDetail.recording_url}
                          className="w-full rounded-xl bg-slate-900"
                        >
                          Your browser does not support audio playback.
                        </audio>
                        <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                          <span>Status: 🟢 Recording Ready</span>
                          <a
                            href={selectedCustomerDetail.recording_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Direct Audio Link
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl">
                        ⚠️ Audio recording processing me hai ya call abhi initiate nahi hui hai. Upar <strong className="text-purple-300">"Sync AI History"</strong> dabakar check karein.
                      </div>
                    )}
                  </div>

                  {/* AI Summary & Intent Card */}
                  {selectedCustomerDetail.ai_summary && (
                    <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span>Maya AI Call Summary & Outcome:</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-sans">
                        {selectedCustomerDetail.ai_summary}
                      </p>
                    </div>
                  )}

                  {/* Speaker-by-Speaker Transcript Viewer */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-purple-400" />
                      Full Conversation Transcript
                    </span>

                    {selectedCustomerDetail.transcript ? (
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 max-h-64 overflow-y-auto">
                        {selectedCustomerDetail.transcript.split('\n').filter(Boolean).map((line, idx) => {
                          const isMaya = line.toLowerCase().startsWith('assistant:') || line.toLowerCase().startsWith('maya:');
                          const isUser = line.toLowerCase().startsWith('user:') || line.toLowerCase().startsWith('customer:');
                          const cleanText = line.replace(/^(assistant|maya|user|customer):\s*/i, '').trim();

                          return (
                            <div
                              key={idx}
                              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-[10px] font-bold mb-0.5 text-slate-400">
                                {isMaya ? '🟣 Maya (AI Executive)' : '🟢 Customer'}
                              </span>
                              <div
                                className={`p-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                                  isUser
                                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-100 rounded-tr-none'
                                    : 'bg-purple-950/80 border border-purple-500/40 text-purple-100 rounded-tl-none'
                                }`}
                              >
                                {cleanText}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                        Is call ka transcript available nahi hai. Call complete hone ke baad Sync karein.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: WHATSAPP QUICK ACTIONS & OFFERS */}
              {detailActiveTab === 'whatsapp' && (
                <div className="space-y-4">
                  {/* Template Selectors */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-300">Quick 1-Click Message Templates:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          const name = selectedCustomerDetail.customer_name || 'Customer';
                          const prod = selectedCustomerDetail.product || 'Amparo Shilajit Gummies';
                          const id = selectedCustomerDetail.shopify_order_id || '#Order';
                          setDetailWaMessage(`Namaste ${name} Ji!\n\nAapka *Amparo Store* se order *${prod}* (${id}) successfully confirm ho gaya hai aur parcel fresh batch se dispatch kar diya gaya hai. 🌿\n\n💵 *COD Amount:* ₹${selectedCustomerDetail.amount || 449}\n🚚 *Delivery:* 3-5 Din me\n\nDhanyawad! Team Amparo Store 🌿`);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-[11px] font-bold text-slate-200 border border-slate-700"
                      >
                        📦 Order Confirmed Notice
                      </button>

                      <button
                        onClick={() => {
                          const name = selectedCustomerDetail.customer_name || 'Customer';
                          const prod = selectedCustomerDetail.product || 'Amparo Shilajit Gummies';
                          setDetailWaMessage(`Namaste ${name} Ji!\n\nAapki request par *${prod}* ki delivery *aaj shaam* ke liye schedule kar di gayi hai. Delivery boy aane se pehle call karega. 🚚\n\nKripya ₹${selectedCustomerDetail.amount || 449} cash ready rakhein. Dhanyawad! 🌿`);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-[11px] font-bold text-slate-200 border border-slate-700"
                      >
                        🚚 Rescheduled (Shaam Tak)
                      </button>

                      <button
                        onClick={() => {
                          const name = selectedCustomerDetail.customer_name || 'Customer';
                          setDetailWaMessage(`Namaste ${name} Ji!\n\n*Amparo Store* se VIP Special Offer! 🎁\n\nAapke number par exclusive *₹50 OFF* coupon code *AMPARO50* activate ho gaya hai. Re-order ya parcel accept karne par direct discount milega.\n\nReply YES to book! 🌿`);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-[11px] font-bold text-slate-200 border border-slate-700"
                      >
                        🎁 VIP Discount (AMPARO50)
                      </button>

                      <button
                        onClick={() => {
                          const name = selectedCustomerDetail.customer_name || 'Customer';
                          setDetailWaMessage(`Namaste ${name} Ji!\n\nAmparo Shilajit Gummies ka regular 60-90 din use karne par 3x stamina aur energy boost milta hai. Best results ke liye daily 1 gummy gun-gune paani ya doodh ke sath lein. 🌿\n\nKoi bhi help chahiye ho to hume message karein!`);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left text-[11px] font-bold text-slate-200 border border-slate-700"
                      >
                        🌿 Ayurvedic Usage Guide
                      </button>
                    </div>
                  </div>

                  {/* Message Editor */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-300">Message Preview:</span>
                    <textarea
                      rows={5}
                      value={detailWaMessage}
                      onChange={(e) => setDetailWaMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                    />
                  </div>

                  {/* WhatsApp Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const clean = String(selectedCustomerDetail.phone).replace(/\D/g, '').slice(-10);
                        const url = `https://web.whatsapp.com/send?phone=91${clean}&text=${encodeURIComponent(detailWaMessage)}`;
                        window.open(url, '_blank');
                      }}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-600/30"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send WhatsApp Web</span>
                    </button>

                    <button
                      onClick={() => {
                        const clean = String(selectedCustomerDetail.phone).replace(/\D/g, '').slice(-10);
                        const url = `https://wa.me/91${clean}?text=${encodeURIComponent(detailWaMessage)}`;
                        window.open(url, '_blank');
                      }}
                      className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Send WhatsApp Mobile</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: LOGISTICS & ADDRESS */}
              {detailActiveTab === 'logistics' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Courier Partner</span>
                        <p className="font-extrabold text-white">{selectedCustomerDetail.courier_name || 'Shiprocket Partner'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Expected Delivery</span>
                        <p className="font-extrabold text-emerald-400">{selectedCustomerDetail.expected_delivery_date || '3-5 Days'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">AWB / Tracking</span>
                        <p className="font-mono font-bold text-blue-300">{selectedCustomerDetail.awb_code || 'Pending AWB'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Payment Mode</span>
                        <p className="font-bold text-yellow-300">Cash on Delivery (₹{selectedCustomerDetail.amount || 449})</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Delivery Address / City</span>
                      <p className="text-xs text-slate-200 font-medium mt-0.5">
                        {selectedCustomerDetail.city || selectedCustomerDetail.notes || 'India'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Direct Action Bar */}
            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    updateCallStatus(selectedCustomerDetail.id, 'confirmed');
                    setSelectedCustomerDetail(prev => ({ ...prev, status: 'confirmed' }));
                    alert(`✅ Order ${selectedCustomerDetail.shopify_order_id} marked CONFIRMED!`);
                  }}
                  className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95 shadow-md shadow-emerald-600/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Order</span>
                </button>

                <button
                  onClick={() => {
                    updateCallStatus(selectedCustomerDetail.id, 'rescheduled');
                    setSelectedCustomerDetail(prev => ({ ...prev, status: 'rescheduled' }));
                    alert(`🟠 Order ${selectedCustomerDetail.shopify_order_id} marked RESCHEDULED!`);
                  }}
                  className="py-2 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Reschedule</span>
                </button>

                <button
                  onClick={() => {
                    updateCallStatus(selectedCustomerDetail.id, 'rto_lost');
                    setSelectedCustomerDetail(prev => ({ ...prev, status: 'rto_lost' }));
                    alert(`🔴 Order ${selectedCustomerDetail.shopify_order_id} marked CANCELLED!`);
                  }}
                  className="py-2 px-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancel Order</span>
                </button>

                <button
                  onClick={() => {
                    const call = selectedCustomerDetail;
                    setSelectedCustomerDetail(null);
                    triggerAiCall({
                      id: call.id,
                      shopify_order_id: call.shopify_order_id,
                      phone: call.phone,
                      customer_name: call.customer_name,
                      product_name: call.product,
                      order_amount: call.amount || 449,
                      call_purpose: call.urgent_rto ? 'RTO_RESCUE' : 'ORDER_CONFIRMATION'
                    }).then(() => alert(`🚀 Maya AI call initiated to ${call.customer_name}!`)).catch(e => alert(e.message));
                  }}
                  className="py-2 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 transition active:scale-95 shadow-md shadow-purple-600/30"
                >
                  <Bot className="w-3.5 h-3.5 text-yellow-300" />
                  <span>🤖 Re-Dial Maya AI</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
