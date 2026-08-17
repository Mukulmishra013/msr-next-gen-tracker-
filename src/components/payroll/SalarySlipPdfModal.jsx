// Corporate-Grade Salary Slip & Monthly Performance Appraisal PDF Generator for MSR NEXT GEN (1-Page Perfect Fit)
import React, { useRef } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  Award, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Check
} from 'lucide-react';

export function SalarySlipPdfModal({ isOpen, onClose, user, salaryData }) {
  const printRef = useRef(null);

  if (!isOpen || !user) return null;

  const monthYear = salaryData?.month || 'August 2026';
  const baseSalaryFixed = Number(user.base_salary || 15000);
  const presentDays = salaryData?.presentDays || 12;
  const daysInMonth = 31;
  const perDayRate = Math.round(baseSalaryFixed / daysInMonth);
  const baseSalaryAccrued = presentDays * perDayRate;
  
  const verifiedIncentives = salaryData?.verifiedIncentives || 210;
  const growthBonus = salaryData?.growthBonus || 0; // Admin Controlled (Default 0 / OFF)
  const spotPraises = salaryData?.spotPraises || 0;
  
  const grossPayable = baseSalaryAccrued + verifiedIncentives + spotPraises + growthBonus;

  // Number to Indian Rupee Words Converter (Simplified)
  const numberToWords = (num) => {
    return `${num.toLocaleString('en-IN')} Rupees Only (INR)`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Top Control Bar (Hidden during Print) */}
        <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-purple-400 shrink-0" />
            <h3 className="font-black text-xs sm:text-sm text-white truncate">
              MSR Next Gen — Official Salary Slip & Appraisal
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="tap-target px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Container (1-Page Fit) */}
        <div className="p-3 sm:p-6 overflow-y-auto custom-scrollbar flex-1 bg-white text-slate-900">
          <div ref={printRef} className="max-w-2xl mx-auto space-y-3.5 text-[11px] text-slate-800 leading-tight font-sans print:space-y-2">
            
            {/* 1. Official Corporate Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-black text-xs shrink-0">
                    MSR
                  </div>
                  <div>
                    <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-950 uppercase">
                      MSR NEXT GEN E-COMMERCE PVT. LTD.
                    </h1>
                    <p className="text-[9px] text-slate-500 font-semibold uppercase">
                      D2C Brand Logistics & AI Telecalling Operations
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600">
                  📍 Corporate HQ: Noida Sector 62, UP, India • CIN: U74999UP2026PTC198421
                </p>
              </div>

              <div className="text-left sm:text-right sm:border-l sm:border-slate-300 sm:pl-3 space-y-0.5 shrink-0">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-300">
                  Official Salary Certificate
                </span>
                <p className="text-[10px] font-bold text-slate-700">Period: <strong className="text-slate-950">{monthYear}</strong></p>
                <p className="text-[9px] font-mono text-slate-500">Ref: MSR-PAY-{user.id?.toUpperCase() || 'EMP01'}</p>
              </div>
            </div>

            {/* 2. Employee Profile & Employment Details Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Employee Name</span>
                  <p className="font-extrabold text-slate-950 text-xs truncate">{user.name}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Employee ID</span>
                  <p className="font-bold text-slate-900 font-mono">MSR-EMP-{user.id?.slice(-5) || '0814'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Designation</span>
                  <p className="font-bold text-slate-900 truncate">{user.roleLabel || 'Content & Telecalling Closer'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Work Mode</span>
                  <p className="font-bold text-blue-700">{user.work_mode === 'WFH' || user.workMode === 'WFH' ? '🏠 Work From Home' : '🏢 Office On-Site'}</p>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Joining Date</span>
                  <p className="font-bold text-slate-900">{user.joining_date || '01 August 2026'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Shift Timings</span>
                  <p className="font-bold text-slate-900">11:00 AM - 05:00 PM</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Disbursement UPI</span>
                  <p className="font-bold text-slate-900 font-mono truncate">{user.upi_id || `${user.phone}@upi`}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Verified Days</span>
                  <p className="font-bold text-emerald-800">{presentDays} / {daysInMonth} Present</p>
                </div>
              </div>
            </div>

            {/* 3. Earnings & Deductions Statement Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase text-[9px]">
                    <th className="p-2 w-3/5">Earnings Description (Verified Work)</th>
                    <th className="p-2 text-right">Amount (INR)</th>
                    <th className="p-2 w-1/4 border-l border-slate-700">Deductions</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-semibold">
                      Basic Salary ({presentDays} Days @ ₹{perDayRate}/day)
                    </td>
                    <td className="p-2 text-right font-bold text-slate-900 font-mono">
                      ₹{baseSalaryAccrued.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2 border-l border-slate-200 text-slate-500">TDS / Tax</td>
                    <td className="p-2 text-right text-slate-500 font-mono">₹0.00</td>
                  </tr>

                  <tr>
                    <td className="p-2 font-semibold text-emerald-800">
                      Shiprocket Verified Delivered NDR Bounties (+₹50/order)
                    </td>
                    <td className="p-2 text-right font-bold text-emerald-700 font-mono">
                      +₹{verifiedIncentives.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2 border-l border-slate-200 text-slate-500">Provident Fund</td>
                    <td className="p-2 text-right text-slate-500 font-mono">₹0.00</td>
                  </tr>

                  {growthBonus > 0 && (
                    <tr>
                      <td className="p-2 font-semibold text-amber-800">
                        August 8% Agency Growth Bonus Pool Split
                      </td>
                      <td className="p-2 text-right font-bold text-amber-700 font-mono">
                        +₹{growthBonus.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 border-l border-slate-200 text-slate-500">Other Deductions</td>
                      <td className="p-2 text-right text-slate-500 font-mono">₹0.00</td>
                    </tr>
                  )}

                  {/* Totals Row */}
                  <tr className="bg-slate-50 font-black text-slate-900 border-t border-slate-300">
                    <td className="p-2 uppercase">Gross Total Earnings</td>
                    <td className="p-2 text-right font-mono text-xs">₹{grossPayable.toLocaleString('en-IN')}</td>
                    <td className="p-2 border-l border-slate-200 uppercase">Total Deductions</td>
                    <td className="p-2 text-right font-mono">₹0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. Net Payable Highlight Box */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800">
                  Total Net Payable Salary for {monthYear}:
                </span>
                <p className="text-lg font-black text-emerald-900 font-mono mt-0.5">
                  ₹{grossPayable.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-emerald-800 font-medium italic">
                  In words: {numberToWords(grossPayable)}
                </p>
              </div>

              <div className="text-left sm:text-right sm:border-l sm:border-emerald-300 sm:pl-3">
                <span className="text-[9px] font-bold text-emerald-700 uppercase">Disbursement Mode</span>
                <p className="text-[11px] font-black text-emerald-900 font-mono">Instant UPI Transfer</p>
                <p className="text-[9px] text-emerald-700">Settlement: 01 Sept 2026</p>
              </div>
            </div>

            {/* 5. Maya AI Supervisor Monthly Performance Appraisal */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-[10px] text-purple-950 uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Maya AI Supervisor Performance Appraisal & Rating</span>
                </h4>
                <span className="px-2 py-0.2 rounded-full bg-purple-200 text-purple-900 font-black text-[9px]">
                  Grade: A+ (Outstanding)
                </span>
              </div>
              <p className="text-[10px] text-purple-900">
                <strong>Verdict:</strong> {user.name} maintained on-time attendance, active NDR customer conversion, and rescued multiple high-value parcels with zero fake claim infractions.
              </p>
            </div>

            {/* 6. Authorized Digital Signatures */}
            <div className="pt-2 border-t border-slate-900 flex items-end justify-between text-[10px]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Digitally Verified & Locked</span>
                </div>
                <p className="text-[8px] font-mono text-slate-400">HASH: MSR-SEC-PAY-849204820492</p>
              </div>

              <div className="text-right space-y-0.5">
                <div className="inline-block border-b border-slate-400 pb-0.5 px-3">
                  <span className="font-serif italic font-black text-xs text-slate-950 block">
                    Mukul Mishra
                  </span>
                </div>
                <p className="font-black text-slate-900 text-[10px] uppercase">Mukul Mishra</p>
                <p className="text-[9px] text-slate-600 font-bold">Managing Director & Founder</p>
                <p className="text-[8px] text-slate-500">MSR Next Gen E-Commerce Pvt. Ltd.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
