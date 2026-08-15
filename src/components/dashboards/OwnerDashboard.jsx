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
  X
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
    updateMayaConfig
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
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Autonomous AI Voice Call Execution Logs</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Customer / Order</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">AI Decision</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Action</th>
                    <th className="p-3 text-right">Recording & Transcript</th>
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
                        {call.recording_url && (
                          <button
                            onClick={() => setSelectedAudioCall(call)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <Volume2 className="w-3 h-3 text-emerald-400" />
                            <span>Play</span>
                          </button>
                        )}
                        {call.transcript && (
                          <button
                            onClick={() => setSelectedTranscriptCall(call)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-bold inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3 text-purple-400" />
                            <span>Transcript</span>
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

    </div>
  );
}
