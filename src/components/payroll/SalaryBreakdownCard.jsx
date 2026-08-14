// Transparent Salary & Incentive Breakdown Card
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Banknote, TrendingUp, CheckCircle2, ShieldCheck, Flame, Gift } from 'lucide-react';

export function SalaryBreakdownCard({ onOpenUpiModal }) {
  const { currentUser } = useAuth();
  const { payroll, incentives, revenueLog } = useAppData();
  const isOwner = currentUser.role === 'owner';

  // Find logged-in user's payroll record
  const userPayroll = payroll.find((p) => p.user_id === currentUser.id) || payroll[0];
  const userIncentives = incentives.filter((i) => i.user_id === currentUser.id);

  return (
    <div className="space-y-5">
      
      {/* 8% Agency Growth Pool Highlight */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                August 8% Agency Growth Bonus Pool
              </h3>
            </div>
            <p className="text-xs text-amber-200/80">
              Agency net growth: ₹{revenueLog.growth_amount?.toLocaleString('en-IN')} ➔ 8% Pool: ₹{revenueLog.bonus_pool_8pct?.toLocaleString('en-IN')} (₹{revenueLog.bonus_per_member?.toLocaleString('en-IN')} per member)
            </p>
          </div>

          <div className="text-right flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-500/40">
              3-Way Equal Split Active
            </span>
          </div>
        </div>
      </div>

      {/* Payroll Table (for Owner) or Personal Sheet (for Employees) */}
      {isOwner ? (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-sm sm:text-base">Team Monthly Payroll Ledger</h3>
              <p className="text-xs text-slate-400">Base Salary + Live Incentives − Deductions</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-500/30">
              Manual UPI Payout Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Base Pay</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Incentives</th>
                  <th className="p-3">Final Payable</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">One-Tap Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payroll.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{item.upi_id}</p>
                    </td>
                    <td className="p-3 font-semibold text-slate-300">
                      ₹{item.base_salary?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-slate-300">
                      <span className="font-bold text-emerald-400">{item.days_present}</span> / {item.total_working_days} Days
                    </td>
                    <td className="p-3 font-bold text-amber-400">
                      +₹{item.total_incentives?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-black text-emerald-400 text-sm">
                      ₹{item.final_payable?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                          item.payment_status === 'paid'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {item.payment_status === 'paid' ? 'PAID ✅' : 'PENDING ⏳'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {item.payment_status !== 'paid' ? (
                        <button
                          onClick={() => onOpenUpiModal(item)}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Individual Employee Transparent View */
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-white text-base">Aapka Monthly Payout Breakdown</h3>
              <p className="text-xs text-slate-400">100% Transparent calculation, 0 hidden deductions</p>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-500/30">
              {userPayroll?.month}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold">Base Salary</p>
              <p className="text-sm font-bold text-slate-200 mt-0.5">₹{userPayroll?.base_salary?.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold">Days Present</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{userPayroll?.days_present} Days</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold">Total Incentives</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">+₹{userPayroll?.total_incentives?.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
              <p className="text-[10px] text-emerald-300 font-semibold">Net Payout</p>
              <p className="text-base font-black text-emerald-400 mt-0.5">₹{userPayroll?.final_payable?.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* User's Incentive Ledger Details */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-300 mb-2">Detailed Incentive Ledger:</h4>
            <div className="space-y-1.5">
              {userIncentives.map((inc) => (
                <div key={inc.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{inc.title}</span>
                  <span className="font-bold text-amber-400">+₹{inc.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
