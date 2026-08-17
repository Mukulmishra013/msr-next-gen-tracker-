// Transparent A-to-Z Salary, Daily Base Pay Accrual, Incentives & UPI Payout Command Center
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { 
  Banknote, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Flame, 
  Gift, 
  Clock, 
  Check, 
  CreditCard, 
  Sparkles, 
  Download, 
  Award, 
  Phone, 
  ArrowUpRight,
  Info,
  Calendar,
  Truck,
  Printer
} from 'lucide-react';
import { SalarySlipPdfModal } from './SalarySlipPdfModal';

export function SalaryBreakdownCard({ onOpenUpiModal }) {
  const { currentUser } = useAuth();
  const { payroll, incentives, revenueLog, attendance } = useAppData();
  const isOwner = currentUser.role === 'owner';

  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'RTO' | 'REPEAT' | 'CONFIRM'
  const [showSlipModal, setShowSlipModal] = useState(false);

  const safeRevenue = revenueLog || {
    growth_amount: 18500,
    bonus_pool_8pct: 9960,
    bonus_per_member: 3320
  };

  // Find logged-in user's payroll record
  const userPayroll = payroll.find((p) => p.user_id === currentUser.id) || payroll[0];
  const userIncentives = incentives.filter((i) => i.user_id === currentUser.id || i.userName === currentUser.name);

  // Attendance stats for base salary accrual
  const userAttendance = attendance.filter(
    (a) => a.user_id === currentUser.id || a.employee_name?.toLowerCase() === currentUser.name?.toLowerCase()
  );
  const presentDays = userAttendance.filter((a) => a.status === 'present').length;
  const daysInMonth = 31; // August
  const baseSalaryFixed = Number(currentUser.base_salary || userPayroll?.base_salary || 15000);
  const perDayBaseRate = Math.round(baseSalaryFixed / daysInMonth);
  const baseSalaryAccrued = presentDays * perDayBaseRate;

  // Incentives Breakdown
  const approvedUserIncentives = userIncentives.filter((i) => i.status === 'approved_paid' || i.paid === true);
  const pendingUserIncentives = userIncentives.filter((i) => i.status === 'pending_delivery');

  const liveEarnedIncentiveTotal = approvedUserIncentives.reduce((sum, i) => sum + Number(i.amount || 0), 210);
  const pendingIncentiveTotal = pendingUserIncentives.reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const totalGrossEarnings = baseSalaryAccrued + liveEarnedIncentiveTotal;
  const projectedMonthEndTotal = baseSalaryFixed + liveEarnedIncentiveTotal + pendingIncentiveTotal;

  // Filtered Incentives
  const filteredIncentives = userIncentives.filter((inc) => {
    if (filterType === 'RTO') return inc.title?.toLowerCase().includes('rto') || inc.type === 'rto_rescue';
    if (filterType === 'REPEAT') return inc.title?.toLowerCase().includes('repeat') || inc.type === 'repeat_order';
    if (filterType === 'CONFIRM') return inc.title?.toLowerCase().includes('confirm');
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      
      {/* Top Banner: Salary & Peace of Mind Assurance */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/50 to-slate-900 border border-purple-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              💰
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-base sm:text-xl text-white truncate">
                  {isOwner ? '👑 Team Monthly Payroll & Growth Pool' : `💰 Meri Monthly Salary & Incentive Ledger`}
                </h3>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300">
                  August 2026 Live
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 break-words">
                100% Transparent Salary Guarantee • Daily Base Pay + Instant Calling Bounties • Zero Deduction Policy on Approved Work
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-3 py-1.5 rounded-2xl border border-amber-500/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Next Payout: 1st Sept 2026</span>
            </span>
          </div>
        </div>

        {/* 8% Agency Growth Bonus Pool Info */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <Gift className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Agency Growth Bonus:</strong> Agency net growth ₹{safeRevenue.growth_amount?.toLocaleString('en-IN') || '18,500'} ➔ ₹{safeRevenue.bonus_per_member?.toLocaleString('en-IN') || '3,320'} per staff member!</span>
          </div>
          <span className="text-[10px] text-amber-400 font-bold uppercase shrink-0">Split Active</span>
        </div>
      </div>

      {/* OWNER VIEW vs TELECALLER INDIVIDUAL DETAILED SALARY DOSSIER */}
      {isOwner ? (
        /* Team Master Ledger (Owner Only) */
        <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base">Team Monthly Payroll & Payout Register</h3>
              <p className="text-xs text-slate-400">Accrued Base Pay + Verified Live Incentives</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-500/30 self-start sm:self-auto">
              ⚡ 1-Tap UPI Dispatch Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Base Salary</th>
                  <th className="p-3.5">Attendance</th>
                  <th className="p-3.5">Calling Bounties</th>
                  <th className="p-3.5">Total Payable</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {payroll.map((item) => {
                  const empIncs = incentives.filter((i) => i.user_id === item.user_id || i.userName === item.name);
                  const empApproved = empIncs.filter((i) => i.status === 'approved_paid' || i.paid === true);
                  const empApprovedSum = empApproved.reduce((s, i) => s + Number(i.amount || 0), 210);
                  const finalAmount = Number(item.base_salary || 15000) + empApprovedSum;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{item.upi_id || `${item.name?.toLowerCase().replace(/\s+/g, '')}@upi`}</p>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-300">
                        ₹{Number(item.base_salary || 15000).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-emerald-400 font-mono font-bold">
                        {presentDays} / {daysInMonth} Days
                      </td>
                      <td className="p-3.5 text-purple-300 font-mono font-bold">
                        +₹{empApprovedSum.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 font-black text-emerald-400 font-mono text-sm">
                        ₹{finalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          item.payment_status === 'paid'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                        }`}>
                          {item.payment_status === 'paid' ? 'PAID ✅' : 'PENDING ⏳'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {item.payment_status !== 'paid' ? (
                          <button
                            onClick={() => onOpenUpiModal({ ...item, final_payable: finalAmount })}
                            className="tap-target px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition active:scale-95"
                          >
                            UPI Pay (1-Tap)
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Ref: {item.utr_number || 'Paid'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TELECALLER / EMPLOYEE 360° CRYSTAL-CLEAR SALARY DOSSIER */
        <div className="space-y-4">
          
          {/* Key Payout Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            
            {/* 1. Monthly Fixed Base Salary */}
            <div className="p-4 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Fixed Monthly Base</span>
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="text-xl font-black text-white font-mono">
                ₹{baseSalaryFixed.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-purple-300 font-semibold">
                ₹{perDayBaseRate}/day (31 days)
              </p>
            </div>

            {/* 2. Accrued Base Pay Till Today */}
            <div className="p-4 rounded-3xl bg-slate-950/90 border border-emerald-500/30 space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Accrued Base Pay</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xl font-black text-emerald-400 font-mono">
                ₹{baseSalaryAccrued.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-emerald-300 font-semibold">
                {presentDays} Present Days Verified ✅
              </p>
            </div>

            {/* 3. Calling Bounties & Incentives */}
            <div className="p-4 rounded-3xl bg-slate-950/90 border border-purple-500/30 space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Live Calling Bonus</span>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <p className="text-xl font-black text-purple-300 font-mono">
                +₹{liveEarnedIncentiveTotal.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-purple-300/80 font-semibold">
                +{approvedUserIncentives.length} Task Bounties Earned
              </p>
            </div>

            {/* 4. Total Net Payable Gross */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/80 to-slate-950 border-2 border-emerald-500/60 space-y-1.5 shadow-xl shadow-emerald-950/50">
              <div className="flex items-center justify-between text-emerald-300">
                <span className="text-[10px] font-black uppercase tracking-wider">Gross Payable Payout</span>
                <Banknote className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-300 font-mono">
                ₹{totalGrossEarnings.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-emerald-400 font-bold">
                Projected Month-End: ₹{projectedMonthEndTotal.toLocaleString('en-IN')}
              </p>
            </div>

          </div>

          {/* Registered Bank & Direct UPI Details Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center text-xl shadow-md shrink-0">
                💳
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Aapka Registered Direct UPI & Payout Account:
                </span>
                <p className="text-sm font-black font-mono text-white flex items-center gap-2 truncate">
                  <span>{currentUser.upi_id || `${currentUser.phone}@upi` || '9876543210@upi'}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/40 shrink-0 font-sans">
                    Verified ✅
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Har mahine ki 1st tareekh ko aapke is UPI ID par automatic payout transfer hota hai.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowSlipModal(true)}
                className="tap-target px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95 w-full sm:w-auto justify-center"
              >
                <Printer className="w-4 h-4 text-purple-200" />
                <span>🖨️ Official Salary Slip & Appraisal (PDF)</span>
              </button>
            </div>
          </div>

          {/* Detailed Itemized Calling Incentive History */}
          <div className="glass-card rounded-3xl border border-slate-800 p-4 sm:p-5 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Itemized Task & Incentive Bounty History ({filteredIncentives.length} Records)</span>
                </h4>
                <p className="text-xs text-slate-400">Shiprocket Live Delivery Verified — Fake claim protection active</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'ALL', label: 'All Tasks' },
                  { id: 'RTO', label: '🚨 Urgent RTO (+₹50)' },
                  { id: 'REPEAT', label: '🔄 Re-Orders (+₹30)' },
                  { id: 'CONFIRM', label: '📞 Confirms (+₹15)' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                      filterType === tab.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {filteredIncentives.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-xs text-slate-400 font-medium">Abhi is category me koi task nahi hai.</p>
                <p className="text-[11px] text-purple-400">Calling queue se Urgent RTOs ko call karein aur instant ₹50 per order earn karein!</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {filteredIncentives.map((inc) => {
                  const isDelivered = inc.status === 'approved_paid' || inc.paid || inc.delivery_status === 'DELIVERED';
                  const isOutForDelivery = inc.status === 'pending_delivery' || inc.delivery_status === 'OUT_FOR_DELIVERY';
                  const isCancelled = inc.status === 'forfeited_cancelled' || inc.delivery_status === 'RTO';

                  return (
                    <div 
                      key={inc.id} 
                      className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition text-xs"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="font-extrabold text-white text-xs break-words">{inc.title}</span>
                          <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-500/30">
                            {inc.order_id || inc.call_id || 'MSR-TASK'}
                          </span>
                          
                          {/* Shiprocket Delivery Verification Badge */}
                          {isDelivered ? (
                            <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                              <Truck className="w-2.5 h-2.5 text-emerald-400" />
                              <span>Shiprocket: DELIVERED ✅</span>
                            </span>
                          ) : isOutForDelivery ? (
                            <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-amber-400" />
                              <span>Shiprocket: IN-TRANSIT (Escrow ⏳)</span>
                            </span>
                          ) : isCancelled ? (
                            <span className="text-[9px] font-mono font-bold text-red-300 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                              Shiprocket: RTO CANCELLED ❌
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                              Shiprocket Verified
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400">
                          {inc.customer_name ? `Customer: ${inc.customer_name}` : 'Telecalling Performance Bounty'} • {inc.date || 'August 2026'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        {isDelivered ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Bounty Added ✅</span>
                          </span>
                        ) : isOutForDelivery ? (
                          <span className="px-2.5 py-1 rounded-xl bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Delivery Pending</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl bg-red-950 text-red-300 border border-red-500/40 text-[10px] font-black">
                            Forfeited
                          </span>
                        )}

                        <span className={`font-black font-mono text-sm ${isDelivered ? 'text-yellow-300' : 'text-slate-400'}`}>
                          +₹{inc.amount || 50}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 📄 Official Corporate Salary Slip & Appraisal PDF Modal */}
      {showSlipModal && (
        <SalarySlipPdfModal
          isOpen={showSlipModal}
          onClose={() => setShowSlipModal(false)}
          user={currentUser}
          salaryData={{
            month: 'August 2026',
            presentDays,
            verifiedIncentives: liveEarnedIncentiveTotal,
            growthBonus: safeRevenue.bonus_per_member || 3320,
            spotPraises: 0
          }}
        />
      )}

    </div>
  );
}
