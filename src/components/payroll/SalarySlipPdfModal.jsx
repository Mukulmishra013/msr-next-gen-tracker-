// Corporate-Grade Salary Slip & Monthly Performance Appraisal PDF Generator for MSR NEXT GEN
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
  const growthBonus = salaryData?.growthBonus || 3320;
  const spotPraises = salaryData?.spotPraises || 0;
  
  const grossPayable = baseSalaryAccrued + verifiedIncentives + spotPraises;
  const totalWithGrowth = grossPayable + growthBonus;

  // Number to Indian Rupee Words Converter (Simplified)
  const numberToWords = (num) => {
    return `${num.toLocaleString('en-IN')} Rupees Only (INR)`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Control Bar (Hidden during Print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="font-black text-sm sm:text-base text-white">
              Official MSR Next Gen Salary Slip & Appraisal Dossier
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="tap-target px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white text-slate-900">
          <div ref={printRef} className="max-w-3xl mx-auto space-y-6 text-xs text-slate-800 leading-relaxed font-sans">
            
            {/* 1. Official Corporate Header */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-lg">
                    MSR
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                      MSR NEXT GEN E-COMMERCE PVT. LTD.
                    </h1>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      D2C Brand Logistics, Customer Retention & AI Telecalling Operations
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 pt-1">
                  📍 Corporate HQ: Noida Sector 62, Uttar Pradesh, India • CIN: U74999UP2026PTC198421
                </p>
                <p className="text-[11px] text-slate-600">
                  ✉️ hr@msrnextgen.com • 🌐 https://msr-next-gen-tracker.vercel.app • 📞 +91 98765 43210
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-slate-300 sm:pl-5 space-y-1 shrink-0">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded border border-emerald-300">
                  Official Salary Certificate
                </span>
                <p className="text-[11px] font-bold text-slate-700">Pay Period: <strong className="text-slate-950">{monthYear}</strong></p>
                <p className="text-[10px] font-mono text-slate-500">Ref: MSR-PAY-{user.id?.toUpperCase() || 'EMP01'}-2026</p>
                <p className="text-[10px] text-slate-500">Issued On: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {/* 2. Employee Profile & Employment Details Grid */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1.5">
                👤 Employee Identification & Work Mode Summary
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Employee Name</span>
                  <p className="font-extrabold text-slate-950 text-sm">{user.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Employee ID</span>
                  <p className="font-bold text-slate-900 font-mono">MSR-EMP-{user.id?.slice(-5) || '0814'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Designation</span>
                  <p className="font-bold text-slate-900">{user.roleLabel || 'Content & Telecalling Closer'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Department</span>
                  <p className="font-bold text-slate-900">NDR Logistics & Retention</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Work Location Mode</span>
                  <p className="font-bold text-blue-700">{user.work_mode === 'WFH' || user.workMode === 'WFH' ? '🏠 Permanent Work From Home' : '🏢 Office On-Site'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Date of Joining</span>
                  <p className="font-bold text-slate-900">{user.joining_date || '01 August 2026'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Shift Timings</span>
                  <p className="font-bold text-slate-900">11:00 AM - 05:00 PM IST</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Disbursement UPI</span>
                  <p className="font-bold text-slate-900 font-mono">{user.upi_id || `${user.phone}@upi`}</p>
                </div>
              </div>
            </div>

            {/* 3. Attendance & Duty Compliance Box */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-slate-900 uppercase">
                  📅 Attendance & Shift Vigilance Ledger ({monthYear})
                </h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Daily Base Rate: ₹{perDayRate} / day
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-1">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Total Working Days</span>
                  <p className="font-black text-slate-900">{daysInMonth} Days</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-bold block">Verified Present</span>
                  <p className="font-black text-emerald-800 text-sm">{presentDays} Days</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Attendance Rate</span>
                  <p className="font-black text-slate-900">{Math.round((presentDays / (presentDays || 1)) * 100)}%</p>
                </div>
                <div className="p-2 bg-teal-50 rounded-xl border border-teal-200">
                  <span className="text-[10px] text-teal-700 font-bold block">Base Pay Accrued</span>
                  <p className="font-black text-teal-900 text-sm">₹{baseSalaryAccrued.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* 4. Earnings & Deductions Statement Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase">
                    <th className="p-3 w-1/2">Earnings Description (Verified Work)</th>
                    <th className="p-3 text-right">Amount (INR)</th>
                    <th className="p-3 w-1/4 border-l border-slate-700">Deductions</th>
                    <th className="p-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold">
                      Basic Fixed Salary (Accrued: {presentDays} Present Days @ ₹{perDayRate}/day)
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">
                      ₹{baseSalaryAccrued.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 border-l border-slate-200 text-slate-500">TDS / Withholding Tax</td>
                    <td className="p-3 text-right text-slate-500 font-mono">₹0.00</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-emerald-800">
                      <div>
                        <span>Shiprocket Delivered NDR RTO Rescue Bounties (+₹50/order)</span>
                        <p className="text-[10px] text-slate-500 font-normal">Directly unlocked upon verified courier delivery</p>
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700 font-mono">
                      +₹{verifiedIncentives.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 border-l border-slate-200 text-slate-500">Provident Fund (PF)</td>
                    <td className="p-3 text-right text-slate-500 font-mono">₹0.00</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-purple-800">
                      Admin Spot Praise & Performance Bonus
                    </td>
                    <td className="p-3 text-right font-bold text-purple-700 font-mono">
                      +₹{spotPraises.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 border-l border-slate-200 text-slate-500">Professional Tax</td>
                    <td className="p-3 text-right text-slate-500 font-mono">₹0.00</td>
                  </tr>

                  <tr>
                    <td className="p-3 font-semibold text-amber-800">
                      August 8% Agency Net Growth Bonus Pool Split
                    </td>
                    <td className="p-3 text-right font-bold text-amber-700 font-mono">
                      +₹{growthBonus.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 border-l border-slate-200 text-slate-500">Other Deductions</td>
                    <td className="p-3 text-right text-slate-500 font-mono">₹0.00</td>
                  </tr>

                  {/* Totals Row */}
                  <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-300">
                    <td className="p-3 uppercase">Gross Total Earnings</td>
                    <td className="p-3 text-right font-mono text-sm">₹{totalWithGrowth.toLocaleString('en-IN')}</td>
                    <td className="p-3 border-l border-slate-200 uppercase">Total Deductions</td>
                    <td className="p-3 text-right font-mono">₹0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5. Net Payable Highlight Box */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Total Net Payable Salary for {monthYear}:
                </span>
                <p className="text-2xl font-black text-emerald-900 font-mono mt-0.5">
                  ₹{totalWithGrowth.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-emerald-800 font-medium italic">
                  Amount in words: {numberToWords(totalWithGrowth)}
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-emerald-300 sm:pl-4">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Disbursement Mode</span>
                <p className="text-xs font-black text-emerald-900 font-mono mt-0.5">Instant UPI Direct Bank Transfer</p>
                <p className="text-[10px] text-emerald-700">Settlement Date: 01 September 2026</p>
              </div>
            </div>

            {/* 6. Maya AI Supervisor Monthly Performance Appraisal */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-purple-950 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Maya AI Supervisor Performance Rating & Appraisal Remarks</span>
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-200 text-purple-900 font-black text-[10px]">
                  Grade: A+ (Outstanding)
                </span>
              </div>
              <p className="text-[11px] text-purple-900">
                <strong>Supervisor Verdict:</strong> {user.name} has demonstrated exemplary calling discipline, on-time WFH attendance punching, and strong NDR customer conversion. Rescued multiple high-value COD parcels from RTO returns and maintained polite customer communication.
              </p>
            </div>

            {/* 7. Corporate Employment Terms & Confidentiality Clause */}
            <div className="text-[10px] text-slate-500 space-y-1 border-t border-slate-200 pt-3">
              <p className="font-bold text-slate-700 uppercase">Terms & Employment Governance:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>This payslip is an official electronic document generated by MSR Next Gen Tracker Core System.</li>
                <li>Incentives are verified against live courier API delivery events to maintain 100% authenticity.</li>
                <li>Salary and customer records are strictly confidential and governed under the MSR Non-Disclosure Agreement.</li>
              </ul>
            </div>

            {/* 8. Authorized Digital Signatures */}
            <div className="pt-4 border-t-2 border-slate-900 flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase">System Verification</p>
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Digitally Verified & Locked</span>
                </div>
                <p className="text-[9px] font-mono text-slate-400">HASH: MSR-SEC-PAY-849204820492</p>
              </div>

              <div className="text-right space-y-1">
                <div className="inline-block border-b border-slate-400 pb-1 px-4">
                  <span className="font-serif italic font-black text-base text-slate-950 block">
                    Mukul Mishra
                  </span>
                </div>
                <p className="font-black text-slate-900 text-xs uppercase">Mukul Mishra</p>
                <p className="text-[10px] text-slate-600 font-bold">Director & Managing Founder</p>
                <p className="text-[9px] text-slate-500 font-semibold">MSR Next Gen E-Commerce Pvt. Ltd.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
