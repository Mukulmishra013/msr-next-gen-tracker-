// Owner & Director Command Center (Revenue, Growth Pool, Attendance, Shiprocket Live Orders & Employee Management)
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
  AlertCircle
} from 'lucide-react';

export function OwnerDashboard({ onOpenUpiModal, onOpenChat }) {
  const { amparoCalls, msrLeads, videos, fieldVisits, attendance, revenueLog, payroll, updateCallStatus } = useAppData();
  const { sendMessageToAgent } = useAgents();
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState('');
  const [activeOwnerTab, setActiveOwnerTab] = useState('overview'); // 'overview' | 'orders' | 'employees' | 'payroll'
  const [isShiprocketModalOpen, setIsShiprocketModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculations
  const totalCalls = amparoCalls.length;
  const savedRtoCount = amparoCalls.filter((c) => c.status === 'rto_saved').length;
  const urgentRtoCount = amparoCalls.filter((c) => c.urgent_rto).length;
  const pendingCallsCount = amparoCalls.filter((c) => c.status === 'pending_confirmation').length;
  const deliveredCount = amparoCalls.filter((c) => c.status === 'confirmed').length;
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
      c.notes?.toLowerCase().includes(q)
    );
  });

  const handleGenerateAiSummary = async () => {
    setAiSummaryLoading(true);
    try {
      const summary = `👑 **MSR Next Gen — Mukul Mishra Admin Brief**
• **Revenue & Growth:** Current Revenue ₹${revenueLog.total_revenue?.toLocaleString('en-IN')}. 8% Growth bonus pool ₹${revenueLog.bonus_pool_8pct} team ledger me active hai.
• **Shiprocket & Logistics:** Total ${totalCalls} live orders in database (${urgentRtoCount} Urgent RTOs, ${pendingCallsCount} Pending Confirmation calls, ${deliveredCount} Delivered).
• **Attendance & Geofence:** ${presentCount} team members present inside 200m GKP office geofence. ${fieldVisits.length} field visits verified with GPS coordinates.
• **Team Operations:** Admin panel active with employee management & instant 1-tap UPI payouts.`;

      setAiSummaryText(summary);
      sendMessageToAgent('Generate executive brief for Mukul Mishra', {
        revenue: revenueLog,
        attendance,
        rtoRecoveryRate,
        totalCalls,
        urgentRtoCount
      });
    } finally {
      setAiSummaryLoading(false);
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
            Real Shiprocket Order Feed, Employee Management, GPS Haaziri & 1-Tap UPI Payroll.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsShiprocketModalOpen(true)}
            className="tap-target px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition active:scale-95"
          >
            <Truck className="w-4 h-4" />
            <span>⚡ Sync Shiprocket Orders</span>
          </button>

          <button
            onClick={handleGenerateAiSummary}
            disabled={aiSummaryLoading}
            className="tap-target px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 disabled:opacity-50"
          >
            {aiSummaryLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Summary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300 animate-spin-slow" />
                <span>AI Brief</span>
              </>
            )}
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
              <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{revenueLog.total_revenue?.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">+₹{revenueLog.growth_amount?.toLocaleString('en-IN')} Growth</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">8% Growth Pool</span>
                <Gift className="w-4 h-4 text-amber-400 animate-bounce-subtle" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">₹{revenueLog.bonus_pool_8pct?.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-amber-300 font-semibold mt-0.5">Active for qualified staff</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">GPS Attendance</span>
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">{presentCount} Present</p>
              <p className="text-[10px] text-blue-300 font-semibold mt-0.5">{outsideOfficeCount} Outside 200m Geofence</p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Shiprocket Orders</span>
                <Truck className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-white mt-1">{totalCalls}</p>
              <p className="text-[10px] text-purple-300 font-semibold mt-0.5">{urgentRtoCount} Urgent RTOs</p>
            </div>
          </div>

          <SalaryBreakdownCard onOpenUpiModal={onOpenUpiModal} />
        </>
      )}

      {/* Orders Tab */}
      {activeOwnerTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Order KPI Cards */}
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
              <p className="text-[10px] font-bold text-emerald-300 uppercase">Delivered / Confirmed</p>
              <p className="text-xl font-black text-emerald-300 mt-0.5">{deliveredCount}</p>
            </div>
          </div>

          {/* Search & Actions Bar */}
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

          {/* Orders Table */}
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
                      <td className="p-3 font-mono text-slate-300">
                        {order.phone}
                      </td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">
                        {order.product}
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        ₹{order.amount}
                      </td>
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

    </div>
  );
}
